import { getContentType } from "@whiskeysockets/baileys";
import logger from "../logger";
import { ChiakiClient, MessagesUpsertType } from "../types/types";
import { serialize } from "../utils/serialize";
import { UsersService, UserRequest } from '../services/user-service';
import { GroupsService } from "../services/group-service";
import { GroupUserRequest } from '../types/domain';

export async function MessageUpsertEvent(messages: MessagesUpsertType, client: ChiakiClient) {
    logger.info("---- Mensagens abaixo -----");
    logger.info(JSON.stringify(messages));

    if (!messages.messages?.length || messages.type !== 'notify') return;

    const M = serialize(JSON.parse(JSON.stringify(messages.messages[0])), client);

    if (!M.message || !M.key || M.key.remoteJid === 'status@broadcast') return;
    if (["protocolMessage", "senderKeyDistributionMessage", "", null].includes(M.type)) return;

    if (M.type === 'viewOnceMessageV2') {
        M.message = M.message[M.type].message;
        M.type = getContentType(M.message);
    }

    const { isGroup, sender, from, body } = M;
    if (!from || !sender) return;

    let remoteJid = "";

    try {
        remoteJid = client.utils.validateRemoteJid(sender).phoneNumber;
    } catch (err) {
        client.log.warn("Erro ao validar remoteJid", err);
        return;
    }

    const isCommand = body.startsWith(client.config.prefix);

    // Processos relacionados ao backend, mas tolerantes a falhas
    try {
        const user = await UsersService.getUser(remoteJid);

        if (user === false) {
            client.log.warn(`Aviso: erro em getUser`);
        } else if (user === null && remoteJid) {
            await createAndAddUserToGroup({ remoteJid, userName: M.pushName || "S/N" }, from);
        } else if (typeof user !== "boolean" && user.nome === "S/N") {
            await UsersService.updateUser({
                remoteJid: remoteJid,
                name: M.pushName,
                roleEnum: 3,
            });
        }
    } catch (err) {
        client.log.warn("[Backend offline tolerado] - falha em getUser/updateUser", err);
    }

    if (isGroup) {
        const target: GroupUserRequest = { groupRemoteJid: from, userRemoteJid: remoteJid };
        const isCmd = body?.startsWith(client.config.prefix);

        client.log.info(`[DEBUG] ${isCmd ? 'Comando' : 'Mensagem'} detectado de ${remoteJid} no grupo ${from}`);

        try {
            if (isCmd) {
                const result = await UsersService.incrementCommands(target);
                if (result === false) {
                    client.log.warn(`[WARN] Usuário ${remoteJid} não cadastrado no grupo. Tentando adicionar...`);
                    await createAndAddUserToGroup({ remoteJid, userName: M.pushName }, from);
                } else if (result === null) {
                    client.log.warn(`[WARN] Backend indisponível para incrementar comandos`);
                } else {
                    client.log.info(`[OK] Comando incrementado para ${remoteJid}`);
                }
            } else {
                const result = await UsersService.incrementMessages(target);
                if (result === false) {
                    client.log.warn(`[WARN] Usuário ${remoteJid} não cadastrado no grupo. Tentando adicionar...`);
                    await createAndAddUserToGroup({ remoteJid, userName: M.pushName }, from);
                } else if (result === null) {
                    client.log.warn(`[WARN] Backend indisponível para incrementar mensagens`);
                } else {
                    client.log.info(`[OK] Mensagem incrementada para ${remoteJid}`);
                }
            }
        } catch (err) {
            client.log.warn(`[Tolerado] Falha ao registrar comando/mensagem: ${err.message}`);
        }
    }

    // Comando SEM depender do backend
    try {
        if (!isCommand) return;

        const commandText = body.slice(client.config.prefix.length).trim();
        const [cmdName, ...args] = commandText.split(' ');
        const arg = args.filter((x) => !x.startsWith('--')).join(' ');
        const flag = args.filter((x) => x.startsWith('--'));

        const command = Array.from(client.cmd.values()).find(cmd =>
            cmd.command.aliases.includes(cmdName)
        );

        if (!command) {
            await M.reply('💔 *Comando não encontrado!!*');
            return;
        }

        if (isGroup && command.command.category === "moderação") {
            const gcMeta = await client.groupMetadata(from).catch(() => null);
            const groupAdmins = gcMeta?.participants.filter((v) => v.admin).map((v) => v.id) || [];

            if (!groupAdmins.includes(sender)) {
                await M.reply('🟨 *Usuário não é admin*');
                return;
            }

            const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
            if (!groupAdmins.includes(botId)) {
                await M.reply(`💔 *Desculpe, o ${client.config.name} não é um admin*`);
                return;
            }
        }

        client.log.info(`Executando comando: ${command.command.name} para ${M.from}`);
        await command.execute(client, flag, arg, M, messages.messages);
    } catch (err) {
        client.log.error('[ERRO NO COMANDO] Mesmo sem backend, algo falhou ao executar comando:', err);
    }
}

async function createAndAddUserToGroup(user: UserRequest, groupId: string): Promise<void> {
    try {
        const newUser = await UsersService.newUser(user);
        if (!newUser) logger.warn("Usuário já cadastrado ou backend offline");

        const newGroupUser = await GroupsService.addUserToGroup({ userId: user.remoteJid, groupId });
        if (!newGroupUser) logger.warn("Usuário já está no grupo ou backend offline");
    } catch (err) {
        logger.warn("[Backend offline tolerado] Erro ao criar/adicionar usuário ao grupo", err);
    }
}
