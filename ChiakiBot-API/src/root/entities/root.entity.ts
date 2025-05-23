import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base-entity.entity';

@Entity('root')
export class Root extends BaseEntity {
  @Column() login: string;
  @Column() senha: string;
}
