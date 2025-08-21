import { Queue } from "bullmq";
import { proto } from "@whiskeysockets/baileys";
import logger from "../logger";
import { valkeyConnectionOpts } from "./valkey-connection-opts";
import { IChiakiCommand } from "../types/types";

export const QUEUE_NAME = "command-queue";

export interface ICommandJob {
  command: IChiakiCommand;
  rawMessage: proto.IWebMessageInfo;
  arg: string;
  flag: string[];
}

const commandQueue = new Queue<ICommandJob>(QUEUE_NAME, { connection: valkeyConnectionOpts });

export const addCommandJob = async (job: ICommandJob): Promise<void> => {
  logger.info(`[Queue] adicionando comando: ${job.command.command.name} a fila`);

  await commandQueue.add('process-command', job, {
    removeOnComplete: true,
    removeOnFail: 5000,
  });
};