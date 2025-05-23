import { proto, WASocket } from '@whiskeysockets/baileys';
import { Logger } from 'winston';
import { ParticipantAction } from "@whiskeysockets/baileys";
import { JidInfo } from './domain';
import { deprecate } from 'util';

/**
 * Configurações do ChiakiBot
 */
export type ChiakiConfig = {
    name: string;
    prefix: string
}
/**
 * Socket de comunicação com o Whatsapp do Baileys extendido
 * @extends {WASocket}
 */
export type ChiakiClient = WASocket & {
  utils: {
    extractNumbers: (text: string) => string[];
    extractUrls: (text: string) => string[];
    removeDuplicates: <T>(arr: T[]) => T[];
    verifyIfFFMPEGisInstalled(): Promise<boolean>;
    validateRemoteJid(remoteJid: string): JidInfo;
  };
  log: Logger;
  config: ChiakiConfig;
  cmd: Map<string, IChiakiCommand>;
};

/**
 * Tipo mais fácil de se usar para mensagens vindas do whatsapp
 * @extends {proto.IWebMessageInfo}
 */
export type SerializedMessage = proto.IWebMessageInfo & {
  id: string;
  from: string;
  sender: string;
  isGroup: boolean;
  isSelf: boolean;
  type: string;
  body: string;
  mentions: string[];
  quoted: {
    type: string;
    stanzaId: string;
    participant: string;
    message: proto.IMessage;
    mtype: string;
    isSelf: boolean;
    text: string;
    key: {
      id?: string;
      fromMe?: boolean;
      remoteJid?: string;
    };
    /** @deprecated */
    download: () => Promise<Buffer>;
  } | null;
  reply: (text: string, options?: any) => Promise<any>;
  /** @deprecated */
  download: () => Promise<Buffer>;
  numbers: string[];
  urls: string[];
};

export type ChiakiCommandCategory = "geral" | "moderação" | "utilidades" | "brincadeiras";

export interface IChiakiCommand {
  command: {
    name: string;
    aliases: string[];
    category: ChiakiCommandCategory;
    usage: string;
    description: string;
  };
  execute(
    client: ChiakiClient,
    flag: string[],
    arg: string,
    M: SerializedMessage,
    rawMessage: proto.IWebMessageInfo[]
  ): Promise<void>;
}

/**
 * Tipo que vem do evento 'group-participants.update'
 */
export type GroupParticipantsEventUpdateType = {
    id: string;
    author: string;
    participants: string[];
    action: ParticipantAction;
}
/**
 * Tipo que vem do event 'messages.upsert'
 */
export type MessagesUpsertType = {
  messages: WAMessage[];
  type: MessageUpsertType;
  requestId?: string;
}