import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn() id: number;
  @CreateDateColumn() dataCadastro: Date;
  @Column({ nullable: true }) dataInativo?: Date;
}
