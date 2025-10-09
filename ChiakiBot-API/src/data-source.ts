import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Group } from './groups/entities/group.entity';
import { GroupUser } from './shared/entities/group-user.entity';
import { Ban } from './ban/entities/ban.entity';
import { Message } from './messages/entities/message.entity';
import { Root } from './root/entities/root.entity';
import { Advertence } from './advertence/entities/advertence.entity';
import { InitialSchema1745020942348 } from './migrations/1745020942348-InitialSchema';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database/db.sqlite',
  entities: [User, Group, GroupUser, Ban, Message, Root, Advertence],
  logging: ['query', 'error', 'schema', 'warn', 'info'],
  migrations: [InitialSchema1745020942348],
  migrationsTableName: 'migrations',
});
