import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ban } from './entities/ban.entity';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { BannedListDto } from './dto/banned-list.dto';
import { User } from '../users/entities/user.entity';
import { BannedUserOnGroupConsult } from './dto/banned-user-on-group-consult';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { PaginationResponse } from '../shared/dtos/pagination-response';

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(Ban)
    private readonly banRepository: Repository<Ban>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findPaginate(filter: PaginationFilter) {
    const [bans, total] = await this.banRepository.findAndCount({
      skip: (filter.pageNumber - 1) * filter.pageSize,
      take: filter.pageSize,
      relations: {
        grupo: true,
      },
    });
    const totalPages = Math.ceil(total / filter.pageSize);

    return {
      data: bans,
      total: totalPages,
    };
  }

  async findAllBansFromUser(filter: PaginationFilter, userRemoteJid: string): Promise<PaginationResponse<Ban[]>> {
    const response = new PaginationResponse<Ban[]>();
    const [userBans, total] = await this.banRepository.findAndCount({
      where: { userRemoteJid: userRemoteJid },
      skip: (filter.pageNumber - 1) * filter.pageSize,
      take: filter.pageSize,
      relations: { grupo: true },
    });
    const totalPages = Math.ceil(total / filter.pageSize);

    if (!userBans && total === 0) throw new NotFoundException('Usuário não encontrado ou sem banimentos');

    response.data = userBans;
    response.totalPages = totalPages;

    return response;
  }

  async createBan(createBanDto: CreateBanDto): Promise<Ban> {
    if (!createBanDto) throw new BadRequestException('Informe os dados');

    if (!createBanDto.motivoBan) throw new BadRequestException('Todo banimento deve ter motivo/razão');

    const now = new Date();
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: createBanDto.groupRemoteJid,
    });
    const user = await this.userRepository.findOneBy({
      remoteJid: createBanDto.userRemoteJid,
    });
    const isUserBanned = await this.banRepository.findOneBy({
      userRemoteJid: createBanDto.userRemoteJid,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!group) throw new NotFoundException('Grupo não encontrado');

    if (!isUserBanned) {
      const bannedUser = this.banRepository.create({
        userRemoteJid: createBanDto.userRemoteJid,
        motivoBan: createBanDto.motivoBan,
        grupo: group,
        dataCadastro: now,
      });

      return await this.banRepository.save(bannedUser);
    }

    isUserBanned.dataInativo = null;
    isUserBanned.dataCadastro = now;

    return await this.banRepository.save(isUserBanned);
  }

  async findAllBannedUsersFromGroup(id: string): Promise<BannedListDto> {
    const group = await this.groupRepository.findOneBy({
      whatsappGroupId: id,
    });

    if (!group) throw new NotFoundException('Grupo não encontrado!');

    const bannedUsersFromGroup = await this.banRepository.findAndCountBy({
      grupo: group,
    });

    const numberBanned = bannedUsersFromGroup[1];
    const usersBanned = bannedUsersFromGroup[0];

    return {
      bannedUsersFromGroup: usersBanned,
      bannedQuantity: numberBanned,
    } as BannedListDto;
  }

  async findBannedUserById(bannedUser: BannedUserOnGroupConsult): Promise<Ban> {
    const grupo = await this.groupRepository.findOneBy({
      whatsappGroupId: bannedUser.groupRemoteJid,
    });

    if (!grupo) throw new NotFoundException('Grupo não encontrado');

    const userFound = await this.banRepository.findOneBy({
      userRemoteJid: bannedUser.userRemoteJid,
      grupo: grupo,
    });

    if (!userFound) throw new NotFoundException('Usuário não encontrado ou não banido');

    return userFound;
  }

  async removeBan(remoteJid: string, groupRemoteJid: string) {
    const now = new Date();
    const group = await this.groupRepository.findOneBy({ whatsappGroupId: groupRemoteJid });
    const bannedUser = await this.banRepository.findOneBy({
      userRemoteJid: remoteJid,
      grupo: group,
    });

    if (!bannedUser) throw new BadRequestException('Usuário não banido ou não encontrado');

    if (bannedUser.dataInativo) throw new BadRequestException('Usuário já foi desbanido');

    bannedUser.dataInativo = now;

    return await this.banRepository.save(bannedUser);
  }
}
