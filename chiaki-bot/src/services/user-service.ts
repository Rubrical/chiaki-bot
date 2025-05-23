import logger from '../logger';
import { api } from './../config/env-config';
import { GroupUserRequest } from '../types/domain';
import { ChiakiError } from '../types/ChiakiError';

const url = "users";
const routes = {
    newUser: `${url}/new`,
    incrementMessages: `${url}/update-message-quantity`,
    incrementCommands: `${url}/update-command-quantity`,
    getUser: `${url}/get-user`,
    newAdmin: `${url}/admin`,
    updateUser: `${url}/update-user`,
}


export const UsersService = {
    newUser: async (user: UserRequest) => {
        return await api.post<UserRequest>(routes.newUser, user)
            .then((createdUser) => {
                logger.info(`Novo usuário criado: ${JSON.stringify(createdUser)}`);
                return true;
            }).catch((err) => {
                logger.warn(err.message);
                return false;
            });
    },
    incrementMessages: async (groupUser: GroupUserRequest) => {
        return await api.post<boolean>(routes.incrementMessages, groupUser)
            .then((messages) => {
                logger.info(`Incremento de mensagens bem-sucessedido`);
                return messages;
            })
            .catch((err: ChiakiError) => {
                logger.warn(`Não foi possível aumentar o número de mensagens do usuário.\n ${err}`);
                if (err.code === 422) return false;
                return null;
            });
    },
    incrementCommands: async (groupUser: GroupUserRequest) => {
        return await api.post<boolean>(routes.incrementCommands, groupUser)
            .then((commands) => {
                logger.info(`Incremento de comandos bem-sucessedido`);
                return commands;
            })
            .catch((err: ChiakiError) => {
                logger.warn(`Não foi possível aumentar o número de mensagens do usuário.\n ${err}`);
                if (err.code === 422) return false;
                return null;
            });
    },
    newAdmin: async (user: UserRequest) => {
        return await api.post<UserRequest>(routes.newAdmin, user)
            .then((createdUser) => {
                logger.info(`Novo admin criado: ${JSON.stringify(createdUser)}`);
                return createdUser;
            }).catch((err) => {
                logger.warn(err.message);
                return null;
            });
    },
    updateUser: async (updatedUser: UpdatedUserRequest) => {
        return await api.post<UserRequest>(routes.updateUser, updatedUser)
            .then((updatedUser) => {
                logger.info(`Usuário atualizado: ${JSON.stringify(updatedUser)}`);
                return updatedUser;
            }).catch((err) => {
                logger.warn(err.message);
                return null;
            });
    },
    getUser: async (remoteJid: string) => {
        return await api.get<UserResponse>(`${routes.getUser}/${remoteJid}`)
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn(err)
                if (err.code === 404) return null; //Usuário não cadastrado no banco
                return false;
            });
    }
};

enum UserRoleEnum {
    DONO = 1,
    ADMINISTRADOR = 2,
    COMUM = 3,
}

export type UserRequest = {
    remoteJid: string;
    userName: string;
}

export type UpdatedUserRequest = {
    remoteJid: string;
    name: string;
    roleEnum: UserRoleEnum;
}

export type UserResponse = {
    remoteJid: string;
    nome: string;
    gruposParticipantes: Array<GroupStatus>;
    quantidadeGruposParticipa: number;
    dataCadastro: Date;
}

type GroupStatus = {
    nomeGrupo: string;
    grupoRemoteJid: string;
    estadoGrupo: boolean;
}