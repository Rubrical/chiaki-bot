import { BaseEntity } from './base-entity.entity';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Advertence } from '../../advertence/entities/advertence.entity';

@Entity('grupo_usuario')
export class GroupUser extends BaseEntity {
  @Column({ default: 0 }) comandosExecutados: number;
  @Column({ default: 0 }) quantidadeMensagens: number;

  @ManyToOne(() => Group, (grupo) => grupo.usuarios)
  @JoinColumn({ name: 'id_grupo' })
  grupo: Group;

  @ManyToOne(() => User, (usuario) => usuario.grupos)
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @OneToMany(() => Advertence, (advertence) => advertence.grupoUsuario)
  advertencias: Advertence[];
}
