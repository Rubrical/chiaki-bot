import { ConnectionState, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import logger from "../logger";
import { ChiakiClient } from "../types/types";
import { loadCommands } from "../commands/commands";
import { startWebSocket, io, stopWebSocket } from "../servers/web-socket";
import { sleep } from "../utils/sleep";

let attempts = 0;
let restarting = false;
const MAX_ATTEMPTS = 15;

const isBoom = (err: unknown): err is Boom => {
    return typeof err === 'object' && err !== null && 'isBoom' in err;
};

export async function ConnectionUpdateEvent(
    event: Partial<ConnectionState>,
    client: ChiakiClient,
    startFn: () => Promise<ChiakiClient | void>,
) {
    const { qr,  connection, lastDisconnect } = event;

    if (qr) {
        startWebSocket();
        client.log.info("QR Code gerado, enviando para painel web");
        io.emit("qr", qr);
    }

    if (connection === "open") {
        attempts = 0;
        restarting = false;
        io.emit("status", "online");
        stopWebSocket();

        if (!client.cmd || client.cmd.size === 0 ) {
            client.log.info("Carregando comandos");
            loadCommands(client);
        } else {
            client.log.info("comandos já carregados");
        }
        return;
    }

    if (connection === "connecting") {
        io.emit("status", "offline");
    }

    if (connection === "close") {
        io.emit("status", "offline");

        const reason = isBoom(lastDisconnect?.error)
        ? lastDisconnect!.error.output.statusCode
        : undefined;

        const shouldReconnect =
        reason !== DisconnectReason.loggedOut &&
        reason !== DisconnectReason.multideviceMismatch;

        if (!shouldReconnect) {
            logger.error("Sessão inválida ou deslogada. Abortando.");
            process.exit(1);
        }

        if (restarting) {
            logger.warn("Reinício já em progresso. Ignorando sinal extra.");
            return;
        }

        if (attempts >= MAX_ATTEMPTS) {
            logger.error("Limite de tentativas excedido. Abortando.");
            process.exit(1);
        }

        restarting = true;
        attempts += 1;

        const backoffMs = Math.min(1000 * 2 ** (attempts - 1), 15000);
        logger.warn(
            `Conexão encerrada: ${lastDisconnect?.error?.message ?? "desconhecido"} ` +
            `(motivo=${reason ?? "?"}). Reiniciando em ${backoffMs}ms [${attempts}/${MAX_ATTEMPTS}]`
        );

        await sleep(backoffMs);
        await startFn();
        restarting = false;
    }
}
