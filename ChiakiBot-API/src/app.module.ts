import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { BanModule } from './ban/ban.module';
import { AdvertenceModule } from './advertence/advertence.module';
import { MessagesModule } from './messages/messages.module';
import { RootModule } from './root/root.module';
import { AppDataSource } from './data-source';
import { Message } from './messages/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([Message]),
    UsersModule,
    GroupsModule,
    BanModule,
    AdvertenceModule,
    MessagesModule,
    RootModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
