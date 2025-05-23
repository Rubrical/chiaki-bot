import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base-entity.entity';
import { GroupUser } from '../../shared/entities/group-user.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('grupos')
export class Group extends BaseEntity {
  @Column()
  @Index('whatsapp_id_group')
  whatsappGroupId: string;

  @Column()
  nomeGrupo: string;

  @Column({ nullable: true })
  donoGrupoId?: string | null;

  @Column({ nullable: true })
  descricaoGrupo?: string | null;

  @Column({ default: true })
  msgEntradaAtiva?: boolean;

  @Column({ default: true })
  msgSaidaAtiva?: boolean;

  @Column({ nullable: true })
  mensagemEntradaId?: number | null;

  @Column({ nullable: true })
  mensagemSaidaId?: number | null;

  @OneToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'mensagemEntradaId' })
  msgEntrada?: Message;

  @OneToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'mensagemSaidaId' })
  msgSaida?: Message;

  @OneToMany(() => GroupUser, (groupUser) => groupUser.grupo)
  usuarios: GroupUser[];
}
