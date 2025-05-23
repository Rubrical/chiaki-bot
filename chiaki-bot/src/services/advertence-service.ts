import { api } from "../config/env-config";
import logger from "../logger";
import { ChiakiError } from "../types/ChiakiError";
import { Advertence } from "../types/domain";

const url = "advertence";
const routes = {
    newAdvertence: `${url}/add-advertence`,
    removeAdvertence: `${url}/remove-advertence`,
    removedExpiredAdvertences: `${url}/remove-expired-advertences`
}

export const AdvertenceService = {
    add: async (req: CreateAdvertenceRequest): Promise<Advertence|string|null> => {
        return await api.post<Advertence>(routes.newAdvertence, req)
            .then((data) => data)
            .catch((error) => {
                if (error.code === 409) return error.message;
                logger.error(`${JSON.stringify(error)}`);
                return null
            });
    },
    remove: async (req: FindAdvertenceRequest): Promise<boolean|string|null> => {
        return await api.patch<boolean>(routes.removeAdvertence, req)
        .then((data) => data)
        .catch((error) => {
            logger.warn(`Erro ao remover advertência ${JSON.stringify(error)}`);
            if (error.code === 500) return error.message;
            return null;
        });
    },
    cleanAll: async () => {
        return await api.post<string>(routes.removedExpiredAdvertences)
            .then((data) => logger.info(`${data}`))
            .catch((error) => logger.warn(`Erro ao limpar todas as advertências ${JSON.stringify(error)}`));
    },
}

export type CreateAdvertenceRequest = {
    userRemoteJid: string;
    whatsappGroupId: string;
    reason: string;
}

export type FindAdvertenceRequest = {
    userRemoteJid: string;
    whatsappGroupId: string;
    activeAdvertences: boolean;
}