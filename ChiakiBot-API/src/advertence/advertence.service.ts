import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../groups/entities/group.entity';
import { GroupUser } from '../shared/entities/group-user.entity';
import { User } from '../users/entities/user.entity';
import { IsNull, LessThan, Repository } from 'typeorm';

import { AdvertenceDto } from './dto/advertence.dto';
import { CreateAdvertenceDto } from './dto/create-advertence.dto';
import { FindAdvertenceDto } from './dto/find-advertence.dto';
import { Advertence } from './entities/advertence.entity';
import { AdvertencePaginationFilter } from './dto/advertence-pagination-filter';
import { PaginationResponse } from '../shared/dtos/pagination-response';
import { PaginationFilter } from '../shared/dtos/pagination-filter';

@Injectable()
export class AdvertenceService {
  private readonly sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  constructor(
    @InjectRepository(Advertence)
    private readonly advertenceRepository: Repository<Advertence>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    @InjectRepository(GroupUser)
    private readonly groupUserRepository: Repository<GroupUser>,
  ) {}

  async create(dto: CreateAdvertenceDto): Promise<AdvertenceDto> {
    const now = new Date();
    const user = await this.userRepository.findOneBy({
      remoteJid: dto.userRemoteJid,
    });
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: dto.whatsappGroupId,
    });

    if (!user) throw new NotFoundException('usuário não encontrado');
    if (!group) throw new NotFoundException('grupo não encontrado');

    const groupUser = await this.groupUserRepository.findOne({
      where: { usuario: user, grupo: group },
      relations: ['grupo', 'usuario'],
    });

    if (!groupUser) {
      throw new UnprocessableEntityException('Usuário não está no grupo especificado');
    }

    const activeAdvertences = await this.countGroupUserActiveAdvertences(groupUser.id);

    if (activeAdvertences >= 2) {
      throw new ConflictException('Usuário deve ser banido - limite de 2 advertências atingido');
    }

    const advertence = this.advertenceRepository.create({
      motivoAdvertencia: dto.reason,
      grupoUsuario: groupUser,
      dataCadastro: now,
    });

    const savedAdvertence = await this.advertenceRepository.save(advertence);

    return {
      motivoAdvertencia: savedAdvertence.motivoAdvertencia,
      dataUltimaAdvertencia: savedAdvertence.dataCadastro,
      usuarioRemoteJid: user.remoteJid,
      nomeUsuario: user.nome || null,
      idGrupoWhatsapp: group.whatsappGroupId,
      nomeGrupo: group.nomeGrupo,
    } as AdvertenceDto;
  }

  async findById(id: number) {
    const advertence = await this.advertenceRepository.findOne({
      where: { id: id },
      relations: {
        grupoUsuario: { usuario: true, grupo: true },
      },
    });

    if (!advertence) throw new BadRequestException('Advertência não encontrada');
    const response: AdvertenceDto = {
      advertenciaQuantidade: 0, // pois é uma consulta
      id: advertence.id,
      dataInativo: advertence.dataInativo,
      motivoAdvertencia: advertence.motivoAdvertencia,
      dataUltimaAdvertencia: advertence.dataCadastro,
      usuarioRemoteJid: advertence.grupoUsuario.usuario.remoteJid,
      idGrupoWhatsapp: advertence.grupoUsuario.grupo.whatsappGroupId,
      nomeUsuario: advertence.grupoUsuario.usuario.nome,
      nomeGrupo: advertence.grupoUsuario.grupo.nomeGrupo,
    };

    return response;
  }

  async findAdvertencesPaginate(
    activeAdvertences: boolean,
    filter: PaginationFilter,
  ): Promise<PaginationResponse<AdvertenceDto[]>> {
    const data: AdvertenceDto[] = [];
    const query = this.advertenceRepository
      .createQueryBuilder('advertence')
      .leftJoinAndSelect('advertence.grupoUsuario', 'grupoUsuario')
      .leftJoinAndSelect('grupoUsuario.grupo', 'grupo')
      .leftJoinAndSelect('grupoUsuario.usuario', 'usuario');

    if (activeAdvertences === true) {
      query.where('advertence.dataInativo IS NULL');
    } else if (activeAdvertences === false) {
      query.where('advertence.dataInativo IS NOT NULL');
    }

    query.skip((filter.pageNumber - 1) * filter.pageSize);
    query.take(filter.pageSize);
    query.orderBy('advertence.dataCadastro', 'DESC');

    const [advertences, total] = await query.getManyAndCount();
    advertences.forEach((adv) => {
      data.push({
        id: adv.id,
        dataInativo: adv.dataInativo,
        advertenciaQuantidade: 0, // pois é uma lista
        dataUltimaAdvertencia: adv.dataCadastro,
        nomeGrupo: adv.grupoUsuario.grupo.nomeGrupo,
        nomeUsuario: adv.grupoUsuario.usuario.nome,
        idGrupoWhatsapp: adv.grupoUsuario.grupo.whatsappGroupId,
        usuarioRemoteJid: adv.grupoUsuario.usuario.remoteJid,
        motivoAdvertencia: adv.motivoAdvertencia,
      });
    });

    return {
      data: data,
      totalPages: Math.ceil(total / filter.pageSize),
    };
  }

  async findUserAdvertencesFromGroup(dto: FindAdvertenceDto): Promise<AdvertenceDto[]> {
    const user = await this.userRepository.findOneBy({
      remoteJid: dto.userRemoteJid,
    });
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: dto.whatsappGroupId,
    });

    if (!user) throw new NotFoundException('usuário não encontrado');
    if (!group) throw new NotFoundException('grupo não encontrado');

    const groupUser = await this.groupUserRepository.findOne({
      where: { usuario: user, grupo: group },
      relations: { usuario: true, grupo: true, advertencias: true },
    });

    if (!groupUser) {
      throw new UnprocessableEntityException('Usuário não está no grupo especificado');
    }

    const userAdvertences = await this.advertenceRepository.find({
      where: { grupoUsuario: groupUser },
      order: { dataCadastro: 'DESC' },
      relations: {
        grupoUsuario: { grupo: true, usuario: true },
      },
    });

    if (!userAdvertences) throw new NotFoundException('Nenhuma advertência encontrada');

    const filteredAdvertences =
      dto.activeAdvertences === true ? userAdvertences.filter((adv) => adv.dataInativo === null) : userAdvertences;

    const totalAdvertences = filteredAdvertences.length;
    const doneReturn: AdvertenceDto[] = [];

    filteredAdvertences.forEach((adv) =>
      doneReturn.push({
        id: adv.id,
        dataInativo: adv.dataInativo,
        advertenciaQuantidade: totalAdvertences,
        dataUltimaAdvertencia: adv.dataCadastro,
        idGrupoWhatsapp: adv.grupoUsuario.grupo.whatsappGroupId,
        nomeGrupo: adv.grupoUsuario.grupo.nomeGrupo,
        nomeUsuario: adv.grupoUsuario.usuario.nome || 'S/N',
        usuarioRemoteJid: adv.grupoUsuario.usuario.remoteJid,
        motivoAdvertencia: adv.motivoAdvertencia,
      }),
    );

    if (doneReturn.length === 0) throw new NotFoundException('Usuário sem advertências ativas');

    return doneReturn;
  }

  async findAllUserAdvertences(filter: AdvertencePaginationFilter): Promise<PaginationResponse<Array<AdvertenceDto>>> {
    const pageSize: number = filter.pageSize;
    const pageNumber: number = filter.pageNumber;
    const skipValue = (pageNumber - 1) * pageSize;
    const user = await this.userRepository.findOneBy({ remoteJid: filter.id });
    const response = new PaginationResponse<AdvertenceDto[]>();

    if (!user) throw new NotFoundException('usuário não encontrado');

    const groupUser = await this.groupUserRepository.findBy({ usuario: user });
    if (!groupUser) throw new NotFoundException('Usuário não está em nenhum grupo');

    const [userAdvertences, total] = await this.advertenceRepository.findAndCount({
      where: { grupoUsuario: groupUser },
      order: { dataCadastro: 'DESC' },
      relations: {
        grupoUsuario: { grupo: true, usuario: true },
      },
      skip: skipValue,
      take: pageSize,
    });

    if (!userAdvertences) throw new NotFoundException('Nenhuma advertência encontrada');

    const filteredAdvertences =
      filter.activeAdvertences === true ? userAdvertences.filter((adv) => adv.dataInativo === null) : userAdvertences;

    const totalAdvertences = filteredAdvertences.length;
    const data: AdvertenceDto[] = [];
    const totalPages = Math.ceil(total / pageSize);

    filteredAdvertences.forEach((adv) =>
      data.push({
        id: adv.id,
        dataInativo: adv.dataInativo,
        advertenciaQuantidade: totalAdvertences,
        dataUltimaAdvertencia: adv.dataCadastro,
        idGrupoWhatsapp: adv.grupoUsuario.grupo.whatsappGroupId,
        nomeGrupo: adv.grupoUsuario.grupo.nomeGrupo,
        nomeUsuario: adv.grupoUsuario.usuario.nome || 'S/N',
        usuarioRemoteJid: adv.grupoUsuario.usuario.remoteJid,
        motivoAdvertencia: adv.motivoAdvertencia,
      }),
    );

    if (data.length === 0) throw new NotFoundException('Usuário sem advertências ativas');

    response.data = data;
    response.totalPages = totalPages;

    return response;
  }

  async findAllAdvertencesFromGroup(filter: AdvertencePaginationFilter): Promise<AdvertenceDto[]> {
    const pageSize: number = filter.pageSize;
    const pageNumber: number = filter.pageNumber;
    const skipValue = (pageNumber - 1) * pageSize;
    const group = await this.groupRepository.findOne({
      where: { whatsappGroupId: filter.id },
    });

    if (!group) throw new NotFoundException('Grupo não encontrado');

    const groupUsers = await this.groupUserRepository.find({
      where: { grupo: group },
    });
    if (!groupUsers || groupUsers.length === 0) {
      throw new NotFoundException('Grupo sem usuários');
    }

    const groupAdvertences = await this.advertenceRepository.find({
      where: { grupoUsuario: groupUsers },
      order: { dataCadastro: 'DESC' },
      relations: {
        grupoUsuario: { grupo: true, usuario: true },
      },
      skip: skipValue,
      take: pageSize,
    });

    if (!groupAdvertences || groupAdvertences.length === 0) {
      throw new NotFoundException('Nenhuma advertência encontrada no grupo');
    }

    const filteredAdvertences =
      filter.activeAdvertences === true ? groupAdvertences.filter((adv) => adv.dataInativo === null) : groupAdvertences;

    if (filteredAdvertences.length === 0) {
      throw new NotFoundException('Grupo sem advertências ativas');
    }

    return filteredAdvertences.map((adv) => ({
      id: adv.id,
      dataInativo: adv.dataInativo,
      advertenciaQuantidade: filteredAdvertences.length,
      dataUltimaAdvertencia: adv.dataCadastro,
      idGrupoWhatsapp: adv.grupoUsuario.grupo.whatsappGroupId,
      nomeGrupo: adv.grupoUsuario.grupo.nomeGrupo,
      nomeUsuario: adv.grupoUsuario.usuario.nome || 'S/N',
      usuarioRemoteJid: adv.grupoUsuario.usuario.remoteJid,
      motivoAdvertencia: adv.motivoAdvertencia,
    }));
  }

  async remove(dto: FindAdvertenceDto): Promise<boolean> {
    const user = await this.userRepository.findOneBy({
      remoteJid: dto.userRemoteJid,
    });
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: dto.whatsappGroupId,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const groupUser = await this.groupUserRepository.findOne({
      where: { usuario: user, grupo: group },
      relations: ['usuario', 'grupo'],
    });

    if (!groupUser) throw new UnprocessableEntityException('Usuário não está no grupo especificado');

    const advertence = await this.advertenceRepository.findOne({
      where: {
        grupoUsuario: groupUser,
        dataInativo: IsNull(),
      },
      order: { dataCadastro: 'DESC' },
      relations: ['grupoUsuario'],
    });

    if (!advertence) {
      throw new NotFoundException('Nenhuma advertencia para este usuário neste grupo');
    }

    advertence.dataInativo = new Date();
    const inactivatedAdvertence = await this.advertenceRepository.save(advertence);

    if (!inactivatedAdvertence) throw new InternalServerErrorException('Advertência não removida');

    return true;
  }

  async cleanExpiredAdvertences(): Promise<string> {
    const expiredAdvertences = await this.advertenceRepository.find({
      where: {
        dataCadastro: LessThan(this.sevenDaysAgo),
        dataInativo: IsNull(),
      },
      relations: ['grupoUsuario.usuario'],
    });

    if (!expiredAdvertences || expiredAdvertences.length === 0)
      throw new BadRequestException('Não há advertências para limpar');

    expiredAdvertences.forEach((advertence) => (advertence.dataInativo = new Date()));

    const updatedAdvertences = await this.advertenceRepository.save(expiredAdvertences);

    if (!updatedAdvertences) throw new InternalServerErrorException('Não foi possível limpar as advertências');

    return 'Advertências limpas com sucesso';
  }

  private async countGroupUserActiveAdvertences(groupUserId: number) {
    return await this.advertenceRepository.count({
      where: {
        grupoUsuario: { id: groupUserId },
        dataInativo: null,
      },
      relations: { grupoUsuario: true },
    });
  }
}
