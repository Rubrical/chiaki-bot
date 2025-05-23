import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Group } from './entities/group.entity';
import { NewGroupDto } from './dtos/new-group-dto';
import { UpdateGroupDto } from './dtos/update-group-dto';
import { GroupUser } from '../shared/entities/group-user.entity';
import { User } from '../users/entities/user.entity';
import { UserTypeEnum } from '../shared/enums/user-type-enum';
import { GroupInfoDto } from './dtos/group-info-dto';
import { MostActiveUsersDto } from './dtos/most-active-users.dto';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { GroupInfoPaginateDto } from './dtos/group-info-paginate.dto';
import { GroupMessageStatusDto } from './dtos/group-message-status.dto';
import { MessageEditDto } from './dtos/message-edit.dto';
import { Message } from '../messages/entities/message.entity';
import { MessageType } from '../shared/types/message-type';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(GroupUser)
    private groupUserRepository: Repository<GroupUser>,
  ) {}

  async newGroup(groupDto: NewGroupDto): Promise<Group> {
    const existingGroup = await this.groupRepository.findOneBy({
      whatsappGroupId: groupDto.whatsappGroupId,
    });

    if (existingGroup) throw new BadRequestException('Grupo já cadastrado!');

    const date = new Date();

    const group = this.groupRepository.create({
      nomeGrupo: groupDto.nomeGrupo,
      whatsappGroupId: groupDto.whatsappGroupId,
      dataCadastro: date,
      descricaoGrupo: groupDto?.descricaoGrupo ?? null,
      donoGrupoId: groupDto?.donoGrupoId ?? null,
    });

    return await this.groupRepository.save(group);
  }

  async editGroup(groupId: string, updatedGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: groupId,
    });

    if (!group) throw new NotFoundException('Grupo não encontrado!');
    Object.assign(group, updatedGroupDto);

    return this.groupRepository.save(group);
  }

  async inactivateGroup(groupId: string): Promise<Group> {
    const date = new Date();
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: groupId,
    });

    if (!group) throw new NotFoundException('Grupo não encontrado!');

    group.dataInativo = date;
    return await this.groupRepository.save(group);
  }

  async addNewUserToGroup(idUser: string, idGroup: string): Promise<GroupUser> {
    const date = new Date();
    const [user, group] = await Promise.all([
      this.userRepository.findOneBy({ remoteJid: idUser }),
      this.groupRepository.findOneBy({ whatsappGroupId: idGroup }),
    ]);

    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const existingUser = await this.groupUserRepository.findOneBy({ grupo: group, usuario: user });

    if (existingUser) {
      existingUser.dataInativo = null;
      await this.groupUserRepository.save(existingUser);

      throw new ConflictException('Usuário já está no grupo');
    }

    const groupUser = this.groupUserRepository.create({
      usuario: user,
      grupo: group,
      dataCadastro: date,
      quantidadeMensagens: 0,
      comandosExecutados: 0,
    });

    return await this.groupUserRepository.save(groupUser);
  }

  async inactivateUserFromGroup(idUser: string, idGroup: string) {
    const groupUser = await this.groupUserRepository.findOne({
      where: {
        grupo: { whatsappGroupId: idGroup },
        usuario: { remoteJid: idUser },
      },
    });

    if (!groupUser) throw new NotFoundException('Associação entre usuário e grupo não encontrada');

    groupUser.dataInativo = new Date();
    return await this.groupUserRepository.save(groupUser);
  }

  async getGroupReport(idGroup: string): Promise<GroupInfoDto> {
    const group = await this.groupRepository.findOne({
      where: { whatsappGroupId: idGroup },
      relations: ['usuarios', 'usuarios.usuario'],
    });

    if (!group) throw new NotFoundException('Grupo não encontrado');

    const totalMembers = group.usuarios.length;
    const totalActiveMembers = group.usuarios.filter((member) => !member.dataInativo).length;
    const adminsCount = group.usuarios.filter(
      (member) => member.usuario.tipoUsuario === UserTypeEnum.ADMINISTRADOR,
    ).length;
    const totalMessages = group.usuarios.reduce((sum, member) => sum + member.quantidadeMensagens, 0);
    const totalCommandsExecuted = group.usuarios.reduce((sum, member) => sum + member.comandosExecutados, 0);
    const botOwner = await this.userRepository.findOneBy({
      tipoUsuario: UserTypeEnum.DONO,
    });
    const ownerName = botOwner ? botOwner.nome : 'Grupo sem Dono';

    return {
      groupName: group.nomeGrupo,
      whatsappGroupId: group.whatsappGroupId,
      dateEntry: group.dataCadastro,
      status: !!group.dataInativo,
      moderatorsQuantity: adminsCount,
      ownerName: ownerName,
      totalActiveMembers: totalActiveMembers,
      totalCommandsExecuted: totalCommandsExecuted,
      totalMembers: totalMembers,
      totalMessagesNumber: totalMessages,
      isGoodByeMessageActive: group.msgSaidaAtiva,
      isWelcomeMessageActive: group.msgEntradaAtiva,
    };
  }

  async getGroupsMembersPaginate(
    idGroup: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ data: Array<User>; total: number }> {
    const [users, total] = await this.groupUserRepository
      .createQueryBuilder('grupo_usuario')
      .innerJoinAndSelect('grupo_usuario.usuario', 'usuario')
      .innerJoin('grupo_usuario.grupo', 'grupo')
      .where('grupo.whatsappGroupId = :idGroup', { idGroup })
      .select([
        'grupo_usuario.id',
        'usuario.id',
        'usuario.remoteJid',
        'usuario.nome',
        'usuario.dataCadastro',
        'usuario.dataInativo',
        'grupo_usuario.comandosExecutados',
        'grupo_usuario.quantidadeMensagens',
        'usuario.tipoUsuario',
        'grupo_usuario.dataCadastro',
      ])
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .cache(120_000)
      .getManyAndCount();

    if (!users.length) throw new NotFoundException('Grupo não encontrado ou sem membros');

    const data = users.map((groupUser) => groupUser.usuario);
    const totalPages = Math.ceil(total / pageSize);

    return { data: data, total: totalPages };
  }

  async getMostActiveMembers(whatsappRemoteJid: string, qty: number): Promise<Array<MostActiveUsersDto>> {
    const usersInfo: MostActiveUsersDto[] = [];
    const users = await this.groupUserRepository
      .createQueryBuilder('grupo_usuario')
      .innerJoinAndSelect('grupo_usuario.usuario', 'usuario')
      .innerJoin('grupo_usuario.grupo', 'grupo')
      .where('grupo.whatsappGroupId = :whatsappRemoteJid', {
        whatsappRemoteJid,
      })
      .andWhere('grupo_usuario.dataInativo is null')
      .orderBy('grupo_usuario.quantidadeMensagens', 'DESC')
      .limit(qty)
      .getMany();

    users.forEach((x) => {
      const userInfo: MostActiveUsersDto = {
        nome: x.usuario.nome,
        remoteJid: x.usuario.remoteJid,
        quantidadeMensagens: x.quantidadeMensagens,
        comandosExecutados: x.comandosExecutados,
      };
      usersInfo.push(userInfo);
    });

    return usersInfo;
  }

  async getGroupsCount(): Promise<number> {
    return await this.groupRepository.count();
  }

  async getGroupsPaginate(filter: PaginationFilter): Promise<{ data: GroupInfoPaginateDto[]; total: number }> {
    const groupDto: GroupInfoPaginateDto[] = [];
    const [groups, total] = await this.groupRepository
      .createQueryBuilder('grupo')
      .skip((filter.pageNumber - 1) * filter.pageSize)
      .take(filter.pageSize)
      .getManyAndCount();
    const totalPages = Math.ceil(total / filter.pageSize);

    groups.forEach((x) => {
      const groupIDto: GroupInfoPaginateDto = {
        id: x.id,
        whatsappGroupId: x.whatsappGroupId,
        groupName: x.nomeGrupo,
        dateEntry: x.dataCadastro,
        isActive: !!x.dataInativo,
      };

      groupDto.push(groupIDto);
    });

    return {
      data: groupDto,
      total: totalPages,
    };
  }

  async activateWelcomeMessage(id: string): Promise<string> {
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    group.msgEntradaAtiva = true;

    await this.groupRepository.save(group);
    return 'Mensagem de boas-vindas ativada com sucesso';
  }

  async deactivateWelcomeMessage(id: string): Promise<string> {
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    group.msgEntradaAtiva = false;

    await this.groupRepository.save(group);
    return 'Mensagem de boas-vindas desativa com sucesso';
  }

  async activateGoodbyeMessage(id: string): Promise<string> {
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    group.msgSaidaAtiva = true;

    await this.groupRepository.save(group);
    return 'Mensagem de despedida ativada com sucesso';
  }

  async deactivateGoodbyeMessage(id: string): Promise<string> {
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    group.msgSaidaAtiva = false;

    await this.groupRepository.save(group);
    return 'Mensagem de despedida desativa com sucesso';
  }

  async groupMessageStatus(id: string): Promise<GroupMessageStatusDto> {
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    return {
      isGoodByeMessageActive: group.msgSaidaAtiva,
      isWelcomeMessageActive: group.msgEntradaAtiva,
    } as GroupMessageStatusDto;
  }

  async editWelcomeMessage(messageDto: MessageEditDto) {
    return await this.checkIfMessageFromGroupExistsAndUpdate(messageDto, 'welcome-message');
  }

  async editGoodbyeMessage(messageDto: MessageEditDto) {
    return await this.checkIfMessageFromGroupExistsAndUpdate(messageDto, 'goodbye-message');
  }

  private async checkIfMessageFromGroupExistsAndUpdate(messageDto: MessageEditDto, messageType: MessageType) {
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: messageDto.groupRemoteJid,
    });

    if (!group) throw new BadRequestException('Grupo não encontrado');

    const messageExists = await this.messageRepository.findOneBy({
      chaveMensagem: `${messageType}:${group.nomeGrupo}`,
    });

    if (!messageExists) {
      const messageNew = this.messageRepository.create({
        dataCadastro: new Date(),
        mensagem: messageDto.messageContent,
        chaveMensagem: `${messageType}:${group.nomeGrupo}`,
      });

      const savedMessage = await this.messageRepository.save(messageNew);

      if (messageType === 'welcome-message') {
        group.mensagemEntradaId = savedMessage.id;
        group.msgEntrada = savedMessage;
      }

      if (messageType === 'goodbye-message') {
        group.mensagemSaidaId = savedMessage.id;
        group.msgSaida = savedMessage;
      }

      await this.groupRepository.save(group);
      return savedMessage;
    }

    messageExists.mensagem = messageDto.messageContent;
    return await this.messageRepository.save(messageExists);
  }

  async reactivateUserFromGroup(idUser: string, idGroup: string): Promise<GroupUser> {
    const [existingUser, existingGroup] = await Promise.all([
      this.userRepository.findOneBy({ remoteJid: idUser }),
      this.groupRepository.findOneBy({ whatsappGroupId: idGroup }),
    ]);

    if (!existingGroup) throw new NotFoundException('Grupo não encontrado');
    if (!existingUser) throw new NotFoundException('Usuário não encontrado');

    const existingGroupUser = await this.groupUserRepository.findOneBy({ usuario: existingUser, grupo: existingGroup });

    if (!existingGroupUser) throw new BadRequestException('Usuário não está no grupo');

    existingGroupUser.dataInativo = null;
    return await this.groupUserRepository.save(existingGroupUser);
  }

  async reactivateGroup(id: string): Promise<Group> {
    const existingGroup = await this.groupRepository.findOneBy({ whatsappGroupId: id });
    if (!existingGroup) throw new NotFoundException('Grupo não encontrado');

    existingGroup.dataInativo = null;
    return await this.groupRepository.save(existingGroup);
  }
}
