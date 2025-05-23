import { BaseEntity } from '../../shared/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity('mensagens')
export class Message extends BaseEntity {
  @Column() chaveMensagem: string;
  @Column() mensagem: string;
  @Column({ nullable: true }) midia: string;
}
