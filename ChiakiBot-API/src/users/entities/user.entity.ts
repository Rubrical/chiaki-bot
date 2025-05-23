import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base-entity.entity';
import { GroupUser } from '../../shared/entities/group-user.entity';

@Entity('usuários')
export class User extends BaseEntity {
  @Column({ unique: true }) @Index('remoteJid') remoteJid: string;
  @Column() nome: string;
  @Column() tipoUsuario: number;
  @OneToMany(() => GroupUser, (groupUser) => groupUser.grupo)
  grupos: GroupUser[];
}
