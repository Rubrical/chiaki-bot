import { Queue } from "bullmq";
import { CacheManager } from "../adapters/cache";
import { proto } from "@whiskeysockets/baileys";

export const QUEUE_NAME = "command-queue";

export interface ICommandJob {
  commandName: string;
  rawMessage: proto.IWebMessageInfo;
  arg: string;
  flag: string[];
}

const commandQueue = new Queue<ICommandJob>(QUEUE_NAME, { connection: CacheManager.connection() });

export const addCommandJob = async (job: ICommandJob): Promise<void> => {
  await commandQueue.add('process-command', job, {
    removeOnComplete: true,
    removeOnFail: 5000,
  });
};