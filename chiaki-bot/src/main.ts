import "./servers/web-server";
import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
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
import { io, startWebSocket, stopWebSocket } from './servers/web-socket';

function getConfig(): ChiakiConfig {
    return {
        name: 'ChiakiBot',
        prefix: process.env.PREFIX || '/',
    }
}

const start = async (): Promise<ChiakiClient | void> => {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const client = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        qrTimeout: 20 * 1000,
    }) as ChiakiClient;

    client.utils = utils;
    client.config = getConfig();
    client.cmd = new Map();
    client.log = logger;

    const isInstalled = client.utils.verifyIfFFMPEGisInstalled();
    if (!isInstalled) {
        logger.warn('O FFMPEG não está instalado, instále-o!');
        return;
    }

    client.ev.on('creds.update', saveCreds);
    client.ev.on('connection.update', async (event) => await ConnectionUpdateEvent(event, client, start));
    client.ev.on('messages.upsert', async (messages) => await MessageUpsertEvent(messages, client));
    client.ev.on("groups.upsert", async (event) => await GroupsUpsert(event, client));
    client.ev.on("groups.update", async (event) => await GroupsUpdate(event, client));
    client.ev.on('group-participants.update', async (event) => await GroupParticipantsEvent(event, client));

    setInterval(AdvertenceService.cleanAll, sevenDays);

    return client;
};


start().catch(err => logger.error(err));
