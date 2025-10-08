import { api } from "../config/env-config";
import logger from "../logger";
import { ChiakiError } from "../types/ChiakiError";
import { Ban } from "../types/domain";

const url = "ban";
const routes = {
    createBan: `${url}/create-ban`,
    findBannedUsersFromGroup: (groupId: string) => `${url}/find-banned-users-from-group/${groupId}`,
    findBan: `${url}/find-ban`,
    removeBan: () => `${url}/remove-ban`,
};

export const BanService = {
    add: async (req: CreateBanRequest): Promise<Ban | string | null> => {
        return await api.post<Ban>(routes.createBan, req)
            .then((data) => data)
            .catch((error: ChiakiError) => {
                if (error.code === 409) return error.message;
                return null;
            });
    },

    remove: async (remoteJid: string, groupId: string): Promise<boolean | string | null> => {
        return await api.patch<boolean>(routes.removeBan(), { userRemoteJid: remoteJid, groupRemoteJid: groupId })
            .then((data) => data)
            .catch((error: ChiakiError) => {
                logger.warn(`[Ban Service] Erro ao remover banimento ${JSON.stringify(error)}`);
                if (error.code === 500) return error.message;
                return null;
            });
    },

    findOne: async (req: FindBanRequest): Promise<Ban | null> => {
        return await api.get<Ban>(routes.findBan, { params: req })
            .then((data) => data)
            .catch((error: ChiakiError) => {
                logger.warn(`[Ban Service] Erro ao buscar banimento: ${JSON.stringify(error)}`);
                return null;
            });
    },

    listGroupBans: async (groupRemoteJid: string): Promise<BannedListDto | null> => {
        return await api.get<BannedListDto>(routes.findBannedUsersFromGroup(groupRemoteJid))
            .then((data) => data)
            .catch((error: ChiakiError) => {
                logger.warn(`[Ban Service] Erro ao listar usuários banidos: ${JSON.stringify(error)}`);
                return null;
            });
    }
};

export type CreateBanRequest = {
    groupRemoteJid: string;
    userRemoteJid: string;
    motivoBan: string;
};

export type FindBanRequest = {
    groupRemoteJid: string;
    userRemoteJid: string;
};

export type BannedListDto = {
    bannedUsersFromGroup: Ban[];
    bannedQuantity: number;
};
