import { CacheManager } from "../adapters/cache";
import logger from "../logger";
import { ChiakiClient } from "../types/types";
import { sleep } from "./sleep";

export async function safeLogout(client: ChiakiClient): Promise<boolean> {
  try {
    if (!client) {
      logger.warn("[safeLogout] Cliente inexistente, ignorando logout.");
      process.exit(0);
    }

    if (client.user) {
      logger.info("[safeLogout] Executando logout via Baileys...");
      try {
        await client.logout();
      } catch (err: any) {
        if (err?.output?.statusCode === 428 || err?.message?.includes("Connection Closed")) {
          logger.warn("[safeLogout] Logout ignorado: conexão já fechada.");
          process.exit(0);
        } else {
          throw err;
        }
      }
    } else {
      logger.warn("[safeLogout] Cliente não autenticado ou já desconectado, pulando logout.");
      process.exit(0);
    }

    await CacheManager.flushPattern("chiaki:auth*");
    logger.info("[safeLogout] Estado limpo com sucesso.");

    await sleep(2000);
    return true;
  } catch (err) {
    logger.error("[safeLogout] Erro inesperado ao desconectar:", err);
    return false;
  }
}
