import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { NewGroupDto } from './dtos/new-group-dto';
import { UpdateGroupDto } from './dtos/update-group-dto';
import { Group } from './entities/group.entity';
import { UserToGroupDto } from './dtos/user-to-group-dto';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { MessageEditDto } from './dtos/message-edit.dto';

@Controller('api/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('new-group')
  async newGroup(@Body() newGroup: NewGroupDto): Promise<Group> {
    return await this.groupsService.newGroup(newGroup);
  }

  @Put('update-group/:id')
  async updateGroup(@Param('id') id: string, @Body() updateGroup: UpdateGroupDto): Promise<Group> {
    return await this.groupsService.editGroup(id, updateGroup);
  }

  @Post('inactivate-group/:id')
  async inactivateGroup(@Param('id') id: string): Promise<Group> {
    return await this.groupsService.inactivateGroup(id);
  }

  @Patch('reactivate-group/:id')
  async reactivateGroup(@Param('id') id: string): Promise<Group> {
    return await this.groupsService.reactivateGroup(id);
  }

  @Post('add-user-to-group')
  async addNewUserToGroup(@Body() addUserToGroup: UserToGroupDto) {
    const idGroup = addUserToGroup.groupId;
    const idUser = addUserToGroup.userId;

    return await this.groupsService.addNewUserToGroup(idUser, idGroup);
  }

  @Put('inactivate-user-from-group')
  async inactivateUserFromGroup(@Body() inactivateUser: UserToGroupDto) {
    const idGroup = inactivateUser.groupId;
    const idUser = inactivateUser.userId;

    return await this.groupsService.inactivateUserFromGroup(idUser, idGroup);
  }

  @Put('reactivate-user-from-group')
  async reactivateUserFromGroup(@Body() reactivateUser: UserToGroupDto) {
    const idGroup = reactivateUser.groupId;
    const idUser = reactivateUser.userId;

    return await this.groupsService.reactivateUserFromGroup(idUser, idGroup);
  }

  @Get('get-report/:id')
  async getGroupReport(@Param('id') id: string) {
    return await this.groupsService.getGroupReport(id);
  }

  @Get('get-group-members-by-filter/:groupId')
  async getGroupMembersPaginate(@Param('groupId') groupId: string, @Query() paginationFilter: PaginationFilter) {
    if (!paginationFilter) paginationFilter = new PaginationFilter();

    const pageNumber = paginationFilter.pageNumber;
    const pageSize = paginationFilter.pageSize;

    return await this.groupsService.getGroupsMembersPaginate(groupId, pageNumber, pageSize);
  }

  @Get('get-most-active-members-from-group/:id')
  async getMostActiveMembers(@Param('id') id: string, @Query('qty') qty: number) {
    if (qty <= 0 || !qty) qty = 5;

    return await this.groupsService.getMostActiveMembers(id, qty);
  }

  @Get('all-groups-count')
  async groupsCount() {
    return await this.groupsService.getGroupsCount();
  }

  @Get('groups-paginate')
  async getGroupsPaginate(@Query() paginationFilter: PaginationFilter) {
    if (paginationFilter === null || paginationFilter === undefined) paginationFilter = new PaginationFilter();

    return await this.groupsService.getGroupsPaginate(paginationFilter);
  }

  @Patch('activate-welcome-message/:id')
  async activateWelcomeMessage(@Param('id') id: string) {
    return await this.groupsService.activateWelcomeMessage(id);
  }

  @Patch('deactivate-welcome-message/:id')
  async deactivateWelcomeMessage(@Param('id') id: string) {
    return await this.groupsService.deactivateWelcomeMessage(id);
  }

  @Patch('activate-goodbye-message/:id')
  async activateGoodbyeMessage(@Param('id') id: string) {
    return await this.groupsService.activateGoodbyeMessage(id);
  }

  @Patch('deactivate-goodbye-message/:id')
  async deactivateGoodbyeMessage(@Param('id') id: string) {
    return await this.groupsService.deactivateGoodbyeMessage(id);
  }

  @Get('check-groups-messages-status/:id')
  async groupMessageStatus(@Param('id') id: string) {
    return await this.groupsService.groupMessageStatus(id);
  }

  @Patch('edit-welcome-message')
  async welcomeMessage(@Body() message: MessageEditDto) {
    return await this.groupsService.editWelcomeMessage(message);
  }

  @Patch('edit-goodbye-message')
  async goodbyeMessage(@Body() message: MessageEditDto) {
    return await this.groupsService.editGoodbyeMessage(message);
  }
}
