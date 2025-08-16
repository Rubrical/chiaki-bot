import logger from "../logger";
import { QUEUE_NAME, ICommandJob } from "./queue";
import { ChiakiClient } from "../types/types";
import { Job, Worker } from "bullmq";
import { CacheManager } from "../adapters/cache";
import { serialize } from "../utils/serialize";

async function setupWorker(client: ChiakiClient) {
  logger.info('Iniciando o worker da fila de comandos');

  new Worker<ICommandJob>(QUEUE_NAME,
    async (job: Job<ICommandJob>)=> {
      const { commandName, rawMessage, arg, flag } = job.data;
      logger.info(`Processando job: ${commandName} de ${rawMessage.key.remoteJid}`);

      const command = Array.from(client.cmd.values()).find(
        (cmd) => cmd.command.name === commandName
      );

      if (!command) {
        logger.error(`Comando "${commandName}" não encontrado no worker. O job falhará.`);
        throw new Error(`Comando não encontrado: ${commandName}`);
      }

      try {
        const M = serialize(rawMessage, client);
        await command.execute(client, flag, arg, M, [rawMessage]);

        logger.info(`Job ${commandName} concluído com sucesso.`);
      } catch (error) {
        logger.error(`Erro ao executar o comando "${commandName}" do job:`, error);
        throw error;
      }
    },
    { connection: CacheManager.connection() }
  );
}