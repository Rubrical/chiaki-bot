import { BanService } from "../services/ban-service";
import { GroupsService } from "../services/group-service";
import { MessageService } from "../services/messages-service";
import { UsersService } from "../services/user-service";
import { ChiakiClient, GroupParticipantsEventUpdateType } from "../types/types";

export async function GroupParticipantsEvent(
    event: GroupParticipantsEventUpdateType,
    client: ChiakiClient
) {
    client.log.info("----- Evento: Atualização de participantes de grupo ------ ");
    client.log.info(JSON.stringify(event));

    const botFullId = client.user.id;
    const botJid = botFullId.includes(":")
        ? botFullId.replace(/:\d+/, "")
        : botFullId;

    const wasRemoved =
        event.action === "remove" &&
        event.participants.some(participant => participant.split(":")[0] === botJid);

    if (wasRemoved) {
        client.log.info(`Bot foi removido do grupo de id ${event.id}`);
        try {
            await GroupsService.inactivateGroup(event.id);
        } catch (err) {
            client.log.warn(`Grupo "${event.id}" não desativado (backend offline tolerado)`);
        }
        return;
    }

    let messageStatus = null;
    try {
        messageStatus = await GroupsService.verifyMessageStatus(event.id);
    } catch (err) {
        client.log.warn("[Backend offline tolerado] Erro ao verificar status de mensagens de grupo");
    }

    const groupMetadata = await client.groupMetadata(event.id).catch(() => null);
    let text: string | null = null;
    let imageBuffer: Buffer | null = null;
    let wasUserBanned = false;

    if (event.action === "add") {
        for (const participant of event.participants) {
            const parsedJid = client.utils.validateRemoteJid(participant).phoneNumber;

            try {
                const ban = await BanService.findOne({ groupRemoteJid: event.id, userRemoteJid: parsedJid });
                if (ban) {
                    client.log.info(`Usuário ${parsedJid} banido anteriormente. Removendo do grupo...`);
                    wasUserBanned = true;
                    try {
                        await client.groupParticipantsUpdate(event.id, [participant], "remove");
                    } catch (err) {
                        client.log.error(`Erro ao remover usuário ${participant}:`, err);
                    }
                    return;
                }
            } catch (err) {
                client.log.warn("[Backend offline tolerado] Erro ao verificar banimento");
            }

            try {
                const user = await UsersService.getUser(parsedJid);
                if (user === null) {
                    await UsersService.newUser({
                        remoteJid: parsedJid,
                        userName: "S/N",
                    });
                    await GroupsService.addUserToGroup({
                        groupId: event.id,
                        userId: parsedJid,
                    });
                } else if (user !== false && user) {
                    await GroupsService.reactivateUserFromGroup({
                        userId: parsedJid,
                        groupId: event.id,
                    });
                }
            } catch (err) {
                client.log.warn("[Backend offline tolerado] Erro ao registrar novo usuário no grupo");
            }

            try {
                if (typeof messageStatus !== "string" && messageStatus?.isWelcomeMessageActive) {
                    const message = await MessageService.getMessage("welcome-message", groupMetadata?.subject);
                    if (message === null) {
                        text = `Seja muito bem-vindo(a) ao nosso grupo! => *${groupMetadata?.subject}* -\n\n💈 *Descrição do Grupo:*\n${groupMetadata?.desc || 'Sem descrição disponível.'}\n\nSiga as regras e se divirta!\n\n*‣ ${event.participants.map(jid => `@${jid.split('@')[0]}`).join(' ')}*`;
                    } else {
                        text = message.mensagem + `\n@${parsedJid}`;
                        if (message.midia) {
                            imageBuffer = await MessageService.getMedia(message.midia);
                        }
                    }
                }
            } catch (err) {
                client.log.warn("[Backend offline tolerado] Erro ao buscar mensagem de boas-vindas");
            }
        }
    } else if (event.action === "remove") {
        for (const participant of event.participants) {
            if (wasUserBanned) return;

            const parsedJid = client.utils.validateRemoteJid(participant).phoneNumber;
            try {
                await GroupsService.inactivateUserFromGroup({ groupId: event.id, userId: parsedJid });
            } catch (err) {
                client.log.warn(`Usuário ${parsedJid} não desativado (backend offline)`);
            }

            try {
                if (typeof messageStatus !== "string" && messageStatus?.isGoodByeMessageActive) {
                    const message = await MessageService.getMessage("goodbye-message", groupMetadata?.subject);
                    if (message === null) {
                        text = `Adeus *${event.participants.map(jid => `@${jid.split('@')[0]}`).join(', ')}* 👋🏻, sentiremos sua falta`;
                    } else {
                        text = message.mensagem;
                        if (message.midia) {
                            imageBuffer = await MessageService.getMedia(message.midia);
                        }
                    }
                }
            } catch (err) {
                client.log.warn("[Backend offline tolerado] Erro ao buscar mensagem de despedida");
            }
        }
    } else if (event.action === "promote" || event.action === "demote") {
        for (const participant of event.participants) {
            const parsedJid = client.utils.validateRemoteJid(participant).phoneNumber;
            try {
                const user = await UsersService.getUser(parsedJid);
                if (user !== null && typeof user !== "boolean") {
                    await UsersService.updateUser({
                        remoteJid: user.remoteJid,
                        name: user.nome,
                        roleEnum: event.action === "promote" ? 2 : 3,
                    });
                }
            } catch (err) {
                client.log.warn(`[Backend offline tolerado] Erro ao atualizar cargo de ${parsedJid}`);
            }
        }
    }

    if (text && !imageBuffer) {
        await client.sendMessage(event.id, {
            text,
            mentions: event.participants
        });
    }

    if (text && imageBuffer) {
        try {
            await client.sendMessage(event.id, {
                image: Buffer.from(imageBuffer),
                caption: text,
                mentions: event.participants,
            });

        } catch(err) {
            const now = new Date(Date.now());
            await client.sendMessage(event.id, { text: `Um erro inesperado ocorreu!\n Servidor interno fora do ar ou outro erro.\n Horário do erro: ${now.toString()}`});
            client.log.error(`${JSON.stringify(err)}`);
        }
    }
}
