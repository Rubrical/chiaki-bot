import { Queue } from "bullmq";
import { CacheManager } from "../adapters/cache";
import { proto } from "@whiskeysockets/baileys";
import logger from "../logger";
import { valkeyConnectionOpts } from "./valkey-connection-opts";

export const QUEUE_NAME = "command-queue";

export interface ICommandJob {
  commandName: string;
  rawMessage: proto.IWebMessageInfo;
  arg: string;
  flag: string[];
}

const commandQueue = new Queue<ICommandJob>(QUEUE_NAME, { connection: valkeyConnectionOpts });

export const addCommandJob = async (job: ICommandJob): Promise<void> => {
  logger.info(`[Queue] adicionando comando: ${job.commandName} a fila`);

  await commandQueue.add('process-command', job, {
    removeOnComplete: true,
    removeOnFail: 5000,
  });
};