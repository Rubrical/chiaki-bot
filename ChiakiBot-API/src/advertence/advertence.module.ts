import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../groups/entities/group.entity';
import { GroupUser } from '../shared/entities/group-user.entity';
import { User } from '../users/entities/user.entity';

import { AdvertenceController } from './advertence.controller';
import { AdvertenceService } from './advertence.service';
import { Advertence } from './entities/advertence.entity';

@Module({
  controllers: [AdvertenceController],
  providers: [AdvertenceService],
  imports: [TypeOrmModule.forFeature([User, Group, GroupUser, Advertence])],
})
export class AdvertenceModule {}
