import logger from "../logger";

import { api } from "../config/env-config";
import { ChiakiError } from "../types/ChiakiError";
import { Group, GroupUser, Message } from "../types/domain";

const url = "groups";
const routes = {
    newGroup: () => `${url}/new-group`,
    updateGroup: (id:string) => `${url}/update-group/${id}`,
    inactivateGroup: (id: string) => `${url}/inactivate-group/${id}`,
    reactivateGroup: (id: string) => `${url}/reactivate-group/${id}`,
    addUserToGroup: () => `${url}/add-user-to-group`,
    inactivateUserFromGroup: () => `${url}/inactivate-user-from-group`,
    reactivateUserFromGroup: () => `${url}/reactivate-user-from-group`,

    getReport: (id: string) => `${url}/get-report/${id}`,
    allGroupsCount: () => `${url}/all-groups-count`,
    getMostActiveMembers: (id: string, qty?: number) =>
        `${url}/get-most-active-members-from-group/${id}?qty=${qty}`,

    activateWelcome: (id: string) => `${url}/activate-welcome-message/${id}`,
    inactivateWelcome: (id: string) => `${url}/deactivate-welcome-message/${id}`,
    activateGoodbye: (id: string) => `${url}/activate-goodbye-message/${id}`,
    inactivateGoodbye: (id: string) => `${url}/deactivate-goodbye-message/${id}`,

    checkMessagesStatus: (id: string) => `${url}/check-groups-messages-status/${id}`,
    editWelcomeMessage: () => `${url}/edit-welcome-message`,
    editGoodbyeMessage: () => `${url}/edit-goodbye-message`,
};


export const GroupsService = {
    createNewGroup: async (group: GroupRequest): Promise<Group|boolean|null> => {
        return await api.post<Group>(routes.newGroup(), group)
            .then((data) => {
                logger.info("Grupo cadastrado com sucesso");
                logger.info(`${JSON.stringify(data)}`);
                return data;
            })
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao cadastrar novo grupo: ${JSON.stringify(err)}`);

                if (err.code === 400) return false
                return null;
            });
    },
    updateGroup: async (id: string, updateGroup: GroupRequest): Promise<Group|null> => {
        return await api.post<Group>(routes.updateGroup(id), updateGroup)
            .then((data) => {
                logger.info("Grupo cadastrado com sucesso");
                logger.info(`${JSON.stringify(data)}`);
                return data;
            })
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao cadastrar novo grupo: ${JSON.stringify(err)}`);
                return null;
            });
    },
    inactivateGroup: async (id: string): Promise<Group|null> => {
        return await api.post<Group>(routes.inactivateGroup(id))
            .then((data) => {
                logger.info("Grupo inativado");
                logger.info(`${JSON.stringify(data)}`);
                return data;
            })
            .catch((err: ChiakiError) => {
                logger.warn("Erro ao inativar grupo");
                logger.warn(`${JSON.stringify(err)}`);
                return null;
            });
    },
    reactivateGroup: async (id: string): Promise<Group|null> => {
        return await api.patch<Group>(routes.reactivateGroup(id))
            .then((data) => {
                logger.info("Grupo reativado");
                logger.info(`${JSON.stringify(data)}`);
                return data;
            })
            .catch((err: ChiakiError) => {
                logger.warn("Erro ao reativar grupo");
                logger.warn(`${JSON.stringify(err)}`);
                return null;
            });
    },
    addUserToGroup: async (data: UserToGroupRequest): Promise<boolean|null> => {
        return await api.post<GroupUser>(routes.addUserToGroup(), data)
            .then((data) => {
                logger.info(`Novo usuário no grupo **${data.grupo.nomeGrupo}**`);
                logger.info(`${JSON.stringify(data)}`);

                return true;
            })
            .catch((err: ChiakiError) => {
                logger.warn("Erro ao adicionar usuário a grupo");
                logger.warn(`${JSON.stringify(err)}`);

                if (err.code === 409) return false;

                return null;
            });
    },
    inactivateUserFromGroup: async (data: UserToGroupRequest): Promise<GroupUser|null> => {
        return await api.put<GroupUser>(routes.inactivateUserFromGroup(), data)
            .then((data) => {
                logger.info(`Usuário ${data.usuario.remoteJid} acaba de sair do grupo ${data.grupo.nomeGrupo}`);
                return data;
            })
            .catch((err) => {
                logger.warn("Erro ao remover usuário do grupo");
                logger.warn(`${JSON.stringify(err)}`);
                return null;
            })
    },
    reactivateUserFromGroup: async (data: UserToGroupRequest): Promise<GroupUser|null> => {
        return await api.put<GroupUser>(routes.reactivateUserFromGroup(), data)
            .then((data) => {
                logger.info(`Usuário ${data.usuario.remoteJid} acaba de voltar pro grupo ${data.grupo.nomeGrupo}`);
                return data;
            })
            .catch((err) => {
                logger.warn("Erro ao reativar usuário do grupo");
                logger.warn(`${JSON.stringify(err)}`);
                return null;
            });
    },

    groupReport: async (id: string) => {
        return await api.get<GroupInfo>(routes.getReport(id))
            .then((data) => {
                return data;
            })
            .catch((err: ChiakiError) => {
                logger.warn(`Houve um erro: ${JSON.stringify(err)}`);
                return err.message;
            });
    },
    allGroupsCount: async () => {
        return await api.get<number>(routes.allGroupsCount())
            .then((data) => data);
    },
    usersRank: async (id: string, qty?: number) => {
        if (qty === undefined) qty = 5;
        return await api.get<UsersRank>(routes.getMostActiveMembers(id, qty))
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(`Um erro ocorreu ao buscar o rank ${err}`);
                return err.message;
            });
    },

    activateWelcome: async (groupId: string): Promise<string> => {
        return await api.patch<string>(routes.activateWelcome(groupId))
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao ativar mensagem de boas vindas: ${JSON.stringify(err)}`);
                return err.message;
            });
    },
    inactivateWelcome: async (groupId: string): Promise<string> => {
        return await api.patch<string>(routes.inactivateWelcome(groupId))
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao desativar mensagem de boas vindas: ${JSON.stringify(err)}`);
                return err.message;
            });
    },
    activateGoodbye: async (groupId: string): Promise<string> => {
        return await api.patch<string>(routes.activateGoodbye(groupId))
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao ativar mensagem de despedidas: ${JSON.stringify(err)}`);
                return err.message;
            });
    },
    inactivateGoodbye: async (groupId: string): Promise<string> => {
        return await api.patch<string>(routes.inactivateGoodbye(groupId))
        .then((data) => data)
        .catch((err: ChiakiError) => {
            logger.warn(`Erro ao desativar mensagem de despedidas: ${JSON.stringify(err)}`);
            return err.message;
        });
    },

    verifyMessageStatus: async (groupId: string): Promise<string | MessagesStatus> => {
        return await api.get<MessagesStatus>(routes.checkMessagesStatus(groupId))
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(`Erro ao ativar mensagem de despedidas: ${JSON.stringify(err)}`);
                return err.message;
            });
    },
    editWelcomeMessage: async (message: MessageEdit): Promise<string | Message> => {
        return await api.patch<Message>(routes.editWelcomeMessage(), message)
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn("Erro ao atualizar mensagem de grupo");
                return err.message;
            });
    },
    editGoodbyeMessage: async (message: MessageEdit): Promise<string | Message> => {
        return await api.patch<Message>(routes.editGoodbyeMessage(), message)
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn("Erro ao atualizar mensagem de grupo");
                return err.message;
            });
    },
}


export type GroupRequest = {
    whatsappGroupId: string;
    nomeGrupo: string;
    donoGrupoId: string|null;
    descricaoGrupo: string|null;
}

export type UserToGroupRequest = {
    userId: string;
    groupId: string;
}

export type GroupInfo = {
    ownerName: string;
    totalActiveMembers: number;
    totalMembers: number;
    moderatorsQuantity: number;
    totalMessagesNumber: number;
    totalCommandsExecuted: number;
    isWelcomeMessageActive: boolean;
    isGoodByeMessageActive: boolean;
}

export type UsersRank = {
    nome: string;
    remoteJid: string;
    quantidadeMensagens: number;
    comandosExecutados: number;
}

export type MessagesStatus = {
    isWelcomeMessageActive: boolean;
    isGoodByeMessageActive: boolean;
}

export type MessageEdit = {
    groupRemoteJid: string;
    messageContent: string;
}