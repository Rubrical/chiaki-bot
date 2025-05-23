import { GroupMetadata } from "@whiskeysockets/baileys";
import { ChiakiClient } from "../types/types";
import { GroupsService } from "../services/group-service";
import { UserRequest, UsersService } from "../services/user-service";

export async function GroupsUpsert(data: GroupMetadata[], client: ChiakiClient): Promise<void> {
    const botFullId = client.user.id;
    const botJid = botFullId.includes(":")
        ? botFullId.replace(/:\d+/, "")
        : botFullId;
    const botId = client.utils.validateRemoteJid(botJid).phoneNumber;

    for (const group of data) {
        const groupId = group.id;

        client.log.info("---- Entrando em um novo grupo ----");
        client.log.info(JSON.stringify(group.desc));

        try {
            await client.sendMessage(groupId, { text: ` ---> *${client.config.name}* <--- \n REALIZANDO CADASTRO EM UM NOVO GRUPO! \n Olá ${group.subject}👋` });
        } catch (err) {
            client.log.warn(`[WHATSAPP] Falha ao enviar mensagem de entrada no grupo ${groupId}: ${err?.message}`);
            continue;
        }

        let newGroup = null;
        try {
            newGroup = await GroupsService.createNewGroup({
                donoGrupoId: group.owner,
                nomeGrupo: group.subject,
                descricaoGrupo: group.desc,
                whatsappGroupId: groupId
            });
        } catch (err) {
            client.log.warn("[Backend offline tolerado] Erro ao criar grupo");
        }

        if (newGroup === null) {
            try {
                await client.sendMessage(groupId, { text: `⚠️ Um erro inesperado ocorreu ao fazer cadastro do grupo! Retire-me do grupo e coloque de novo!` });
            } catch {}
            return;
        } else if (newGroup === false) {
            try {
                const reactivated = await GroupsService.reactivateGroup(groupId);
                if (!reactivated) {
                    await client.sendMessage(groupId, { text: "⚠️ Um erro inesperado ocorreu ao reativar!" });
                    return;
                }
                await client.sendMessage(groupId, { text: `Grupo Reativado! É bom estar de volta!` });
            } catch (err) {
                client.log.warn("[Backend offline tolerado] Erro ao reativar grupo");
            }
        }

        try {
            await client.sendMessage(groupId, { text: `✅ Cadastro do grupo feito com sucesso ` });
            await client.sendMessage(groupId, { text: " ---> Iniciando cadastro dos usuários! <--- " });
        } catch (err) {
            client.log.warn(`[WHATSAPP] Erro ao enviar mensagens de progresso para ${groupId}: ${err?.message}`);
        }

        for (const user of group.participants) {
            const username = user.name ? user.name : "S/N";
            const isAdmin = user?.admin;
            const userJid = client.utils.validateRemoteJid(user.id).phoneNumber;
            const userRequest: UserRequest = { remoteJid: userJid, userName: username };

            if (userJid !== botId) {
                try {
                    const checkIfUserExist = await UsersService.getUser(userJid);

                    if (checkIfUserExist === null && !isAdmin) await UsersService.newUser(userRequest);
                    if (checkIfUserExist === null && (isAdmin === "admin" || isAdmin === "superadmin"))
                        await UsersService.newAdmin(userRequest);
                    if (checkIfUserExist === false)
                        await client.sendMessage(groupId, { text: `Um erro inesperado ocorreu cadastrando o usuário @${userJid}` });
                } catch (err) {
                    client.log.warn(`[Backend offline tolerado] Falha ao cadastrar usuário ${userJid}`);
                }

                try {
                    await GroupsService.addUserToGroup({ groupId: groupId, userId: userJid });
                } catch (err) {
                    client.log.warn(`[Backend offline tolerado] Falha ao associar ${userJid} ao grupo`);
                }
            }
        }

        try {
            await client.sendMessage(groupId, { text: "✅ Cadastro do grupo completo! Bot pronto para uso!" });
            await client.sendMessage(groupId, { text: `➡️ Próximo passo:\n configurar mensagens personalizadas de entrada e saída!\n Utilize o comando ${client.config.prefix}menu para saber mais` });
        } catch (err) {
            client.log.warn(`[WHATSAPP] Erro ao enviar mensagem final para ${groupId}: ${err?.message}`);
        }
    }
}
