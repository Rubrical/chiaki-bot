import { proto } from "@whiskeysockets/baileys";
import { GroupsService, MessageEdit } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const editBv: IChiakiCommand = {
    command: {
        name: "edit-bv",
        aliases: ["edit-bv"],
        category: "moderação",
        usage: "edit-bv <nova mensagem>",
        description: "Edita a mensagem de boas-vindas do grupo.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const newMessage = arg.trim();
        const groupId = M.from;

        if (!newMessage) {
            await M.reply("❗ Você precisa informar a nova mensagem de boas-vindas.");
            return;
        }

        const payload: MessageEdit = {
            groupRemoteJid: groupId,
            messageContent: newMessage
        };

        const result = await GroupsService.editWelcomeMessage(payload);

        if (typeof result === "string") {
            await M.reply(`⚠️ Erro ao atualizar mensagem de boas-vindas:\n${result}`);
        } else {
            await M.reply("✅ Mensagem de boas-vindas atualizada com sucesso!");
        }
    }
};

export default editBv;
