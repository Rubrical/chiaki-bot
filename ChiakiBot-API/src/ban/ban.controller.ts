import { Body, Controller, Get, InternalServerErrorException, Param, Patch, Post, Query } from '@nestjs/common';
import { BanService } from './ban.service';
import { CreateBanDto } from './dto/create-ban.dto';
import { Ban } from './entities/ban.entity';
import { BannedListDto } from './dto/banned-list.dto';
import { BannedUserOnGroupConsult } from './dto/banned-user-on-group-consult';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { RemoveBanDto } from './dto/remove-ban.dto';

@Controller('api/ban')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Post('create-ban')
  async create(@Body() createBanDto: CreateBanDto): Promise<Ban> {
    return await this.banService.createBan(createBanDto);
  }

  @Get('find-banned-users-from-group/:id')
  async findAllBannedUsersFromGroup(@Param('id') id: string): Promise<BannedListDto> {
    return await this.banService.findAllBannedUsersFromGroup(id);
  }

  @Get('find-ban')
  async findOne(@Query() bannedUser: BannedUserOnGroupConsult) {
    return await this.banService.findBannedUserById(bannedUser);
  }

  @Get('find-ban-paginate')
  async findPaginate(@Query() filter: PaginationFilter) {
    return await this.banService.findPaginate(filter);
  }

  @Get('find-bans-from-user/:id')
  async findBansFromUser(@Param('id') id: string, @Query() filter: PaginationFilter) {
    return this.banService.findAllBansFromUser(filter, id);
  }

  @Patch('/remove-ban/')
  async update(@Body() removeBanDto: RemoveBanDto): Promise<boolean> {
    const nonBannedUser = await this.banService.removeBan(removeBanDto.userRemoteJid, removeBanDto.groupRemoteJid);
    if (!nonBannedUser) {
      throw new InternalServerErrorException('Um erro ocorreu. O usuário não foi banido');
    }

    return true;
  }
}
