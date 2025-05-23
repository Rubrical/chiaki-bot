import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';
import { GroupUser } from '../shared/entities/group-user.entity';
import { Message } from '../messages/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, GroupUser, Message])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
