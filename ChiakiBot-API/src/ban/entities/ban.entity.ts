import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../shared/entities/base-entity.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('banidos')
export class Ban extends BaseEntity {
  @Column({ unique: true, name: 'remoteJid' })
  userRemoteJid: string;

  @Column({ nullable: true }) motivoBan?: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'id_grupo' })
  grupo: Group;
}
