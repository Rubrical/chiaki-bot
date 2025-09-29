import { ConnectionState, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import logger from "../logger";
import { ChiakiClient } from "../types/types";
import { loadCommands } from "../commands/commands";
import { startWebSocket, io, stopWebSocket } from "../servers/web-socket";


// let connectionAttempts = 0;

const isBoom = (err: unknown): err is Boom => {
    return typeof err === 'object' && err !== null && 'isBoom' in err;
};

export async function ConnectionUpdateEvent(
    event: Partial<ConnectionState>,
    client: ChiakiClient,
    // startFn: () => Promise<ChiakiClient|void>,
) {
    const { qr,  connection, lastDisconnect } = event;

    if (qr) {
        startWebSocket();
        client.log.info("QR Code gerado, enviando para painel web");
        io.emit("qr", qr);
    }

    if (connection === "open") {
        io.emit("status", "online");
        stopWebSocket();
    }

    if (connection === "close" || connection === "connecting") {
        io.emit("status", "offline");
    }

    if (connection === "close") {
        const shouldReconnect =
            isBoom(lastDisconnect?.error) &&
            lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

        // if (connectionAttempts >= 5) {
        //     logger.error("Limite de tentativas excedido. Abortando.");
        //     process.exit(1);
        // }
        if (shouldReconnect) {
            logger.warn(`Conexão encerrada por motivo: ${lastDisconnect?.error?.message}. Reconectando...`);
        } else {
            logger.error("Conexão encerrada permanentemente (logged out). Abortando.");
            process.exit(1);
        }

        // logger.warn(`Conexão encerrada. Reconectando (${connectionAttempts + 1}/5)...`);
        // connectionAttempts++;

        // if (shouldReconnect) await startFn();
    }

    if (connection === "open") {
        // connectionAttempts = 0;
        logger.info("Chiaki Bot! De pé e operante!");
        loadCommands(client);
    }
}
