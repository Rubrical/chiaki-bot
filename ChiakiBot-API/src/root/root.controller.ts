import { Controller, Body, Get, Post, Put, Param } from '@nestjs/common';
import { RootService } from './root.service';
import { RootDto } from './dto/root.dto';
import { UpdateRootDto } from './dto/update-root.dto';

@Controller('api/root')
export class RootController {
  constructor(private readonly rootService: RootService) {}

  @Get('check-if-exists')
  async find() {
    return await this.rootService.checkIfExists();
  }

  @Post('new')
  async create(@Body() createRootDto: RootDto) {
    return await this.rootService.create(createRootDto);
  }

  @Post('login')
  async login(@Body() loginDto: RootDto) {
    return await this.rootService.login(loginDto);
  }

  @Put('update/:id')
  async update(@Param(':id') id: number, @Body() updateDto: UpdateRootDto) {
    return await this.rootService.update(id, updateDto);
  }
}
