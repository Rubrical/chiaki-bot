import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { AdvertenceService } from './advertence.service';
import { CreateAdvertenceDto } from './dto/create-advertence.dto';
import { FindAdvertenceDto } from './dto/find-advertence.dto';
import { AdvertencePaginationFilter } from './dto/advertence-pagination-filter';
import { PaginationFilter } from '../shared/dtos/pagination-filter';

@Controller('api/advertence')
export class AdvertenceController {
  constructor(private readonly advertenceService: AdvertenceService) {}

  @Post('add-advertence')
  async create(@Body() createAdvertenceDto: CreateAdvertenceDto) {
    return await this.advertenceService.create(createAdvertenceDto);
  }

  @Get('find-all-user-advertences')
  async findAllUserAdvertences(@Query() filter: AdvertencePaginationFilter) {
    return await this.advertenceService.findAllUserAdvertences(filter);
  }

  @Get('find-all-advertences-from-group/')
  async findOne(@Query() filter: AdvertencePaginationFilter) {
    return await this.advertenceService.findAllAdvertencesFromGroup(filter);
  }

  @Get('find-advertences-paginate')
  async findAdvertencesPaginate(@Query() filter: PaginationFilter, @Query('active') active: boolean) {
    return await this.advertenceService.findAdvertencesPaginate(active, filter);
  }

  @Get('find-advertence-by-id/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.advertenceService.findById(id);
  }

  @Patch('remove-advertence')
  async update(@Body() dto: FindAdvertenceDto) {
    return await this.advertenceService.remove(dto);
  }

  @Post('remove-expired-advertences')
  async removeAll() {
    return await this.advertenceService.cleanExpiredAdvertences();
  }
}
