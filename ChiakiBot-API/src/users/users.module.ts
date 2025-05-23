import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupUser } from '../shared/entities/group-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Group, GroupUser])],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
