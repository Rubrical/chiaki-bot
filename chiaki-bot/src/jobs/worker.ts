import logger from "../logger";
import { QUEUE_NAME, ICommandJob } from "./queue";
import { ChiakiClient } from "../types/types";
import { Job, Worker } from "bullmq";
import { serialize } from "../utils/serialize";
import { valkeyConnectionOpts } from "./valkey-connection-opts";

export async function setupWorker(client: ChiakiClient) {
  logger.info('[WORKER] Fila de comandos iniciada');

  new Worker<ICommandJob>(QUEUE_NAME,
    async (job: Job<ICommandJob>) => {
      const { rawMessage, arg, flag } = job.data;
      const commandName = job.data.command.command.name;

      logger.info(`[WORKER] Processando job: ${commandName} de ${rawMessage.key.remoteJid}`);

      const command = Array.from(
          client.cmd.values()).find((cmd) => cmd.command.name === commandName
      );

      if (!command) {
        logger.error(`[WORKER] Comando "${commandName}" não encontrado no worker. O job falhará.`);
        throw new Error(`Comando não encontrado: ${commandName}`);
      }

      try {
        const M = serialize(rawMessage, client);
        logger.info(`[Worker] Executando comando: ${commandName} para ${M.from}`);

        await command.execute(client, flag, arg, M, [rawMessage]);
        logger.info(`[WORKER] Job ${commandName} concluído com sucesso.`);
      } catch (error) {
        logger.error(`[WORKER] Erro ao executar o comando "${commandName}" do job:`, error);
        throw error;
      }
    },
    {
      connection: valkeyConnectionOpts,
      concurrency: 20,
    }
  );
}