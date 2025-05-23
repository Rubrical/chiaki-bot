import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { PaginationResponse } from '../shared/dtos/pagination-response';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private messageRepository: Repository<Message>) {}

  async createAsync(createMessageDto: CreateMessageDto): Promise<Message> {
    const now = new Date();
    const message = this.messageRepository.create({
      ...createMessageDto,
      dataCadastro: now,
    });

    return await this.messageRepository.save(message);
  }

  async findPaginateAsync(paginationFilter: PaginationFilter, active: boolean): Promise<PaginationResponse<Message[]>> {
    const query = this.messageRepository.createQueryBuilder('mensagens');

    if (active === true) {
      query.where('mensagens.dataInativo IS NULL');
    } else {
      query.where('mensagens.dataInativo IS NOT NULL');
    }

    const [data, total] = await query
      .skip((paginationFilter.pageNumber - 1) * paginationFilter.pageSize)
      .take(paginationFilter.pageSize)
      .getManyAndCount();

    return {
      totalPages: Math.ceil(total / paginationFilter.pageSize),
      data: data,
    };
  }

  async findMessageByCodeMessageAsync(id: string): Promise<Message> {
    const message = await this.messageRepository.findOneBy({
      chaveMensagem: id,
    });

    if (!message) throw new NotFoundException('Mensagem não encontrada');

    return message;
  }

  async updateAsync(id: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.messageRepository.findOneBy({ id: id });

    if (!message) throw new NotFoundException('Mensagem não encontrada');

    Object.assign(message, updateMessageDto);

    return await this.messageRepository.save(message);
  }

  async deactivateAsync(id: number) {
    const now = new Date();
    const message = await this.messageRepository.findOneBy({ id: id });

    if (!message) throw new NotFoundException('Mensagem não encontrada');

    message.dataInativo = now;

    return await this.messageRepository.save(message);
  }

  async reactivateAsync(id: number) {
    const message = await this.messageRepository.findOneBy({ id: id });

    if (!message) throw new NotFoundException('Mensagem não encontrada');

    message.dataInativo = null;

    return await this.messageRepository.save(message);
  }

  async addImageOrGifToMessageAsync(id: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');

    const message = await this.messageRepository.findOneBy({ id: id });
    if (!message) throw new NotFoundException('Mensagem não encontrada');

    if (message.midia) {
      const oldFilePath = path.join(process.cwd(), `uploads/${message.midia}`);
      try {
        await fs.promises.access(oldFilePath);
        await fs.promises.unlink(oldFilePath);
      } catch (err) {
        console.error(`Erro ao excluir arquivo antigo: ${err.message}`);
        throw new InternalServerErrorException('Erro ao excluir a mídia antiga');
      }
    }

    message.midia = file.filename;
    return await this.messageRepository.save(message);
  }
}
