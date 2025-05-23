import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../shared/entities/base-entity.entity';
import { GroupUser } from '../../shared/entities/group-user.entity';

@Entity('advertencias')
export class Advertence extends BaseEntity {
  @Column() motivoAdvertencia: string;

  @ManyToOne(() => GroupUser)
  @JoinColumn({ name: 'id_grupo_usuario' })
  grupoUsuario: GroupUser;
}
