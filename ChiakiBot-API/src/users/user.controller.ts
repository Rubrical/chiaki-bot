import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { NewUserDto } from './dtos/new-user-dto';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user-dto';
import { UserRoleDto } from './dtos/user-role-dto';
import { UpdatedUserDto } from './dtos/updated-user-dto';
import { UserGroupDto } from './dtos/user-group-dto';
import { PaginationFilter } from '../shared/dtos/pagination-filter';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('new')
  async createNewUser(@Body() newUser: NewUserDto): Promise<User> {
    return await this.userService.registerUser(newUser);
  }

  @Post('owner')
  async registerNewOwner(@Body() newUser: NewUserDto): Promise<User> {
    return await this.userService.registerOwner(newUser);
  }

  @Post('update-message-quantity')
  async updateMessageQuantity(@Body() userGroup: UserGroupDto): Promise<boolean> {
    return await this.userService.incrementMessageNumber(userGroup);
  }

  @Get('get-user/:id')
  async getUserByRemoteJid(@Param('id') id: string): Promise<UserDto> {
    return await this.userService.findUserByRemoteJid(id);
  }

  @Get('get-users-paginate')
  async getPaginate(@Query() paginationFilter: PaginationFilter) {
    const filter = paginationFilter || new PaginationFilter();
    return await this.userService.getUserPaginte(filter);
  }

  @Get('get-user-role')
  async getUserRoleByRemoteJid(@Body('id') id: string): Promise<UserRoleDto> {
    return await this.userService.getUserRole(id);
  }

  @Post('admin')
  async registerNewAdmin(@Body() newUser: NewUserDto): Promise<User> {
    return await this.userService.registerAdmin(newUser);
  }

  @Post('update-command-quantity')
  async updateCommandQuantity(@Body() userGroup: UserGroupDto): Promise<boolean> {
    return await this.userService.incrementCommandNumber(userGroup);
  }

  @Post('update-user')
  async updateUserById(@Body() updatedUser: UpdatedUserDto): Promise<User> {
    return await this.userService.updateUser(updatedUser);
  }

  @Get('get-count')
  async getUsersCount() {
    return await this.userService.getUsersCount();
  }
}
