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
import { startWebServer } from './servers/aux-web-server';
import { sleep } from './utils/sleep';

async function getConfig(): Promise<ChiakiConfig> {
    return {
        name: process.env.BOT_NAME || 'ChiakiBot',
        prefix: process.env.PREFIX || '/',
        startTime: new Date().toLocaleDateString('pt-BR', {
          timeZone: "America/Sao_Paulo",
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false
        }),
        botRoot: await RootService.getRootName(),
    }
}

const start = async (): Promise<ChiakiClient | void> => {
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

  await sleep(15_000);

  client.utils = utils;
  client.config = await getConfig();
  client.cmd = new Map();
  client.log = logger;

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

  logger.info("[init] checando dependências externas com timeout de 3 segundos");

  try {
    await client.utils.verifyIfFFMPEGisInstalled();
  } catch (e) {
    logger.warn("FFMPEG check falhou/timeout. Verifique PATH. Continuando mesmo assim.");
  }

  try {
    await client.utils.verifyIfYtDlpIsInstalled();
  } catch (e) {
    logger.warn("yt-dlp check falhou/timeout. Verifique binário. Continuando mesmo assim.");
  }

  logger.info("[init] iniciado worker de comandos")
  await setupWorker(client);
  setInterval(AdvertenceService.cleanAll, sevenDays);

  return client;
};

start().catch(err => logger.error(err));
