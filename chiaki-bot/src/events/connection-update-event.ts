import { ConnectionState, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import logger from "../logger";
import { ChiakiClient } from "../types/types";
import { loadCommands } from "../commands/commands";
import { startWebSocket, io, stopWebSocket } from "../servers/web-socket";
import { sleep } from "../utils/sleep";
import { CacheManager } from "../adapters/cache";

let attempts = 0;
let restarting = false;
let presenceInterval: NodeJS.Timeout | undefined;
const MAX_ATTEMPTS = 15;
const isBoom = (err: unknown): err is Boom => {
  return typeof err === 'object' && err !== null && 'isBoom' in err;
};

export async function ConnectionUpdateEvent(
  event: Partial<ConnectionState>,
  client: ChiakiClient,
  startFn: () => Promise<ChiakiClient | void>,
) {
  const {qr, connection, lastDisconnect} = event;

  if (qr) {
    startWebSocket();
    client.log.info("[Connection Update Event] QR Code gerado, enviando para painel web");
    io.emit("qr", qr);
  }

  if (connection === "open") {
    attempts = 0;
    restarting = false;
    io.emit("status", "online");
    stopWebSocket();

    if (presenceInterval) clearInterval(presenceInterval);
    presenceInterval = setInterval(
      async () => await client.sendPresenceUpdate("available"), 60_000
    );

    if (!client.cmd || client.cmd.size === 0) {
      client.log.info("[Connection Update Event] Carregando comandos");
      loadCommands(client);
      const {setupWorker} = await import("./../jobs/worker");
      logger.info("[init] iniciado worker de comandos")
      await setupWorker(client);
    } else {
      client.log.info("[Connection Update Event] comandos já carregados");
    }
    return;
  }

  if (connection === "connecting") {
    io.emit("status", "offline");
  }

  if (connection === "close") {
    io.emit("status", "offline");
    if (presenceInterval) {
      clearInterval(presenceInterval);
      presenceInterval = undefined;
    }

    const reason = isBoom(lastDisconnect?.error)
      ? lastDisconnect.error.output.statusCode
      : undefined;

    const msg = lastDisconnect?.error?.message ?? "desconhecido";
    logger.warn(`[Connection] Encerrada: ${msg} (motivo=${reason})`);

    switch (reason) {
      case DisconnectReason.loggedOut:
      case DisconnectReason.badSession:
      case DisconnectReason.multideviceMismatch:
        logger.error("[Connection] Sessão inválida. Limpando Redis e aguardando novo QR.");
        await CacheManager.flushPattern("chiaki:auth*");
        await sleep(1000);
        await startFn();
        return;

      case DisconnectReason.connectionLost:
      case DisconnectReason.restartRequired:
      case DisconnectReason.timedOut:
      case 428:
      case 515:
        if (restarting) {
          logger.warn("[Connection] Reinício já em andamento. Ignorando sinal extra.");
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          logger.error("[Connection] Limite de tentativas atingido. Abortando.");
          process.exit(1);
        }

        restarting = true;
        attempts += 1;

        const backoff = Math.min(250 * attempts, 3000);
        logger.warn(`[Connection] Tentando reconexão em ${backoff}ms [${attempts}/${MAX_ATTEMPTS}]`);
        await sleep(backoff);

        try {
          client.ev.removeAllListeners("connection.update");
          await startFn();
        } catch (err) {
          logger.error(`[Connection] Falha ao reiniciar: ${(err as Error).message}`);
        } finally {
          restarting = false;
        }
        return;

      default:
        logger.error(`[Connection] Desconexão inesperada. Encerrando processo.`);
        logger.error(JSON.stringify(lastDisconnect?.error, null, 2));
        process.exit(1);
    }
  }
}
