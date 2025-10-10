import makeWASocket from '@whiskeysockets/baileys';
import P from 'pino';
import logger from './logger';
import * as utils from './utils/utils';
import { ChiakiClient, ChiakiConfig } from './types/types';
import { ConnectionUpdateEvent } from './events/connection-update-event';
import { GroupParticipantsEvent } from './events/group-participants-event';
import { MessageUpsertEvent } from './events/messages-upsert-event';
import { GroupsUpsert } from './events/groups-upsert-event';
import { GroupsUpdate } from './events/groups-update-event';
import { AdvertenceService } from './services/advertence-service';
import { CacheManager } from "./adapters/cache";
import { setupWorker } from "./jobs/worker";
import { chiakiCustomAuth } from './adapters/chiaki-custom-auth';
import { startWebSocket } from './servers/web-socket';
import { RootService } from './services/root-service';
import { startWebServer } from './servers/bot-web-server';
import { sleep } from './utils/sleep';
import { GroupsService } from './services/group-service';
import { UsersService } from './services/user-service';

export const programStartTime = new Date();
const startTime = new Date().toLocaleDateString('pt-BR', {
  timeZone: "America/Sao_Paulo",
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false
});

async function getConfig(): Promise<ChiakiConfig> {
  return {
      name: process.env.BOT_NAME || 'ChiakiBot',
      prefix: process.env.PREFIX || '/',
      startTime: startTime,
      botRoot: await RootService.getRootName(),
      environment: `${process.env.BOT_NAME ?? "ChiakiBot"} powered by\n Docker🐋 & Node｡🇯‌🇸‌ `,
      groupsCount: await GroupsService.allGroupsCount(),
      registeredMembers: await UsersService.getCount(),
  }
}

const start = async (): Promise<ChiakiClient | void> => {
  // lazy start for better backend accesss
  await sleep(15_000);

  logger.info("[init] criando redis conexão");
  const redis = CacheManager.connection();

  logger.info("[init] carregando authState");
  const { state, saveCreds } = await chiakiCustomAuth(redis, "chiaki:auth");
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  logger.info("[init] criando socket Baileys");
  let client: ChiakiClient;
  try {
    client = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      qrTimeout: 20_000,
      shouldSyncHistoryMessage: () => false,
      cachedGroupMetadata: async (jid) => CacheManager.get(`groups:${jid}`)
    }) as ChiakiClient;
  } catch (e) {
    logger.error("erro ao criar socket de conexão");
    logger.error(JSON.stringify(e));
    throw e;
  }

  client.utils = utils;
  client.config = await getConfig();
  client.cmd = new Map();
  client.log = logger;
  client.botRoot = client.config.botRoot;
  client.startTime = startTime;

  logger.info("[init] registrando eventos");
  client.ev.on('creds.update', saveCreds);
  client.ev.on('connection.update', async (event) => await ConnectionUpdateEvent(event, client, start));
  client.ev.on('messages.upsert', async (m) => await MessageUpsertEvent(m, client));
  client.ev.on("groups.upsert", async (e) => await GroupsUpsert(e, client));
  client.ev.on("groups.update", async (e) => await GroupsUpdate(e, client));
  client.ev.on('group-participants.update', async (e) => await GroupParticipantsEvent(e, client));

  logger.info("[init] Iniciando serviços web");
  startWebSocket();
  startWebServer(client);

  logger.info("[init] checando dependências externas");

  try {
    await client.utils.verifyIfFFMPEGisInstalled();
  } catch (e) {
    logger.warn("FFMPEG check falhou/timeout. Verifique PATH. Continuando mesmo assim.");
    logger.error(JSON.stringify(e));
  }

  try {
    await client.utils.verifyIfYtDlpIsInstalled();
  } catch (e) {
    logger.warn("yt-dlp check falhou/timeout. Verifique binário. Continuando mesmo assim.");
    logger.error(JSON.stringify(e));
  }

  setInterval(AdvertenceService.cleanAll, sevenDays);

  return client;
};

start().catch(err => logger.error(`${JSON.stringify(err)}`));
