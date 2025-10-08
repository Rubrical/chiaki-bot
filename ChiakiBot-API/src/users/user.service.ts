import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { NewUserDto } from './dtos/new-user-dto';
import { UserTypeEnum } from '../shared/enums/user-type-enum';
import { UserDto } from './dtos/user-dto';
import { UserRoleDto } from './dtos/user-role-dto';
import { UpdatedUserDto } from './dtos/updated-user-dto';
import { GroupUser } from '../shared/entities/group-user.entity';
import { UserGroupDto } from './dtos/user-group-dto';
import { Group } from '../groups/entities/group.entity';
import { GroupParticipatingDto } from './dtos/group-participating.dto';
import { PaginationFilter } from '../shared/dtos/pagination-filter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
  ) {}

  async getUserPaginte(filter: PaginationFilter) {
    const [userList, total] = await this.userRepository.findAndCount({
      skip: (filter.pageNumber - 1) * filter.pageSize,
      take: filter.pageSize,
    });
    const totalPages = Math.ceil(total / filter.pageSize);

    return {
      data: userList,
      total: totalPages,
    };
  }

  async registerUser(newUser: NewUserDto): Promise<User> {
    const { remoteJid, userName } = newUser;
    const dataNow = new Date();
    const userExists = await this.userRepository.findOne({
      where: { remoteJid: remoteJid },
    });

    if (userExists) throw new BadRequestException('Usuário já cadastrado no banco');

    const createdUser = this.userRepository.create({
      remoteJid: remoteJid,
      nome: userName,
      dataCadastro: dataNow,
      tipoUsuario: UserTypeEnum.COMUM,
    });

    return await this.userRepository.save(createdUser);
  }

  async registerOwner(user: NewUserDto): Promise<User> {
    const { remoteJid, userName } = user;

    const existingOwner = await this.userRepository.findOne({
      where: { tipoUsuario: UserTypeEnum.DONO },
    });

    if (existingOwner) throw new BadRequestException('Já existe um dono');

    const existingUser = await this.userRepository.findOne({
      where: { remoteJid: remoteJid },
    });

    if (existingUser === null) {
      const newOwner = this.userRepository.create({
        remoteJid: remoteJid,
        nome: userName,
        tipoUsuario: UserTypeEnum.DONO,
        dataCadastro: new Date(),
      });

      return await this.userRepository.save(newOwner);
    }

    await this.userRepository.update(existingUser.remoteJid, {
      tipoUsuario: UserTypeEnum.DONO,
    });

    return await this.userRepository.findOne({
      where: { remoteJid: existingUser.remoteJid },
    });
  }

  async incrementMessageNumber(userGroup: UserGroupDto) {
    const [existingUser, existingGroup] = await Promise.all([
      this.userRepository.findOneBy({ remoteJid: userGroup.userRemoteJid }),
      this.groupRepository.findOneBy({ whatsappGroupId: userGroup.groupRemoteJid }),
    ]);

    if (!existingGroup) throw new NotFoundException('Grupo não encontrado');
    if (!existingUser) throw new NotFoundException('Usuário não encontrado');

    const groupUser = await this.groupUserRepository.findOneBy({
      grupo: { id: existingGroup.id },
      usuario: { id: existingUser.id },
    });

    console.log('⬇ buscando GroupUser com', {
      groupId: existingGroup.id,
      userId: existingUser.id,
    });

    if (!groupUser) throw new UnprocessableEntityException('Usuário não está no grupo');

    groupUser.quantidadeMensagens = groupUser.quantidadeMensagens + 1;

    await this.groupUserRepository.save(groupUser);

    return true;
  }

  async findUserByRemoteJid(remoteJid: string) {
    const existingUser = await this.userRepository.findOneBy({
      remoteJid: remoteJid,
    });

    if (!existingUser) throw new NotFoundException('Usuário com remoteJid informado não encontrado');

    const [groupsUserIsIn, groupsUserAreInCount] = await this.groupUserRepository.findAndCount({
      where: { usuario: existingUser },
      relations: ['grupo', 'usuario'],
    });

    if (!groupsUserIsIn) throw new BadRequestException('Usuário não está em nenhum grupo');

    const groupsDto: GroupParticipatingDto[] = [];
    groupsUserIsIn.forEach((x) => {
      const groupDto: GroupParticipatingDto = {
        grupoRemoteJid: x.grupo.whatsappGroupId,
        nomeGrupo: x.grupo.nomeGrupo,
        estadoGrupo: !x.dataInativo,
      };

      groupsDto.push(groupDto);
    });

    return {
      remoteJid: remoteJid,
      nome: !existingUser.nome ? 'S/N' : existingUser.nome,
      dataCadastro: existingUser.dataCadastro,
      quantidadeGruposParticipa: groupsUserAreInCount,
      gruposParticipantes: groupsDto,
    } as UserDto;
  }

  async registerAdmin(user: NewUserDto): Promise<User> {
    const { remoteJid, userName } = user;
    const dataNow = new Date();
    const existingUser = await this.userRepository.findOneBy({
      remoteJid: remoteJid,
    });

    if (existingUser === null) {
      const newAdmin = this.userRepository.create({
        remoteJid: remoteJid,
        nome: userName,
        tipoUsuario: UserTypeEnum.ADMINISTRADOR,
        dataCadastro: dataNow,
      });

      return await this.userRepository.save(newAdmin);
    }

    if (existingUser.tipoUsuario === UserTypeEnum.ADMINISTRADOR)
      throw new InternalServerErrorException('Usuário já é um administrador');

    existingUser.tipoUsuario = UserTypeEnum.ADMINISTRADOR;
    await this.userRepository.update(existingUser.remoteJid, {
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
    });

    return await this.userRepository.findOneBy({
      remoteJid: remoteJid,
    });
  }

  async getUserRole(remoteJid: string): Promise<UserRoleDto> {
    const user = await this.userRepository.findOneBy({
      remoteJid: remoteJid,
    });

    const userDto = new UserRoleDto();

    userDto.userName = user.nome;
    userDto.role = user.tipoUsuario;

    return userDto;
  }

  async incrementCommandNumber(userGroup: UserGroupDto) {
    const [existingUser, existingGroup] = await Promise.all([
      this.userRepository.findOneBy({ remoteJid: userGroup.userRemoteJid }),
      this.groupRepository.findOneBy({ whatsappGroupId: userGroup.groupRemoteJid }),
    ]);

    if (!existingGroup) throw new NotFoundException('Grupo não encontrado');
    if (!existingUser) throw new NotFoundException('Usuário não encontrado');

    const groupUser = await this.groupUserRepository.findOneBy({
      grupo: { id: existingGroup.id },
      usuario: { id: existingUser.id },
    });

    if (!groupUser) throw new UnprocessableEntityException('Usuário não está no grupo');

    groupUser.comandosExecutados = groupUser.comandosExecutados + 1;
    await this.groupUserRepository.save(groupUser);

    return true;
  }

  async updateUser(updateUserDto: UpdatedUserDto): Promise<User> {
    if (updateUserDto.newRole && (updateUserDto.newRole > 3 || updateUserDto.newRole < 1))
      throw new BadRequestException('Cargo inválido. Utilizar de 1 a 3');

    const existingUser = await this.userRepository.findOneBy({
      remoteJid: updateUserDto.remoteJid,
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    existingUser.remoteJid = updateUserDto.remoteJid;
    existingUser.nome = updateUserDto.name;
    existingUser.tipoUsuario = updateUserDto.newRole;

    return await this.userRepository.save(existingUser);
  }

  async getUsersCount(): Promise<number> {
    return await this.userRepository.count();
  }
}
