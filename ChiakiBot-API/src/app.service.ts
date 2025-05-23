import { Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './messages/entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly messages: Partial<Message>[] = [
    {
      chaveMensagem: 'joke:beijar',
      mensagem: '💋 *Beijando*',
    },
    {
      chaveMensagem: 'joke:tapa',
      mensagem: '*👋*',
    },
    {
      chaveMensagem: 'joke:gay',
      mensagem: '*🌈 {A} é {PERCENTAGE}% gay hoje!*',
    },
    {
      chaveMensagem: 'joke:shipp',
      mensagem: '*💞 {A} e {B} são um casal nota {PERCENTAGE}!*',
    },
    {
      chaveMensagem: 'joke:roubar',
      mensagem: '*👜 {A} roubou tudo de {B}!*',
    },
    {
      chaveMensagem: 'joke:rico',
      mensagem: '*💸 {A} tem {PERCENTAGE} mil reais na conta!*',
    },
    {
      chaveMensagem: 'joke:casar',
      mensagem: '*💍 {A} casou com {B}!*',
    },
    {
      chaveMensagem: 'joke:divorciar',
      mensagem: '*💔 {A} se divorciou de {B}.*',
    },
    {
      chaveMensagem: 'joke:gostosa',
      mensagem: '*🔥 {A} tem {PERCENTAGE}% de gostosura.*',
    },
    {
      chaveMensagem: 'joke:cutucar',
      mensagem: '*👉 {A} cutucou {B}!*',
    },
    {
      chaveMensagem: 'joke:chance',
      mensagem: '*🎯 A chance de "{MSG}" acontecer é de {PERCENTAGE}%.*',
    },
  ];

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async onModuleInit() {
    console.log('Executing seed...');
    await this.messagesSeed();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async messagesSeed() {
    for (const message of this.messages) {
      const exists = await this.messageRepository.findOneBy({ chaveMensagem: message.chaveMensagem });
      if (!exists) {
        const newMsg = this.messageRepository.create({ ...message });
        await this.messageRepository.save(newMsg);
      }
    }
  }
}
