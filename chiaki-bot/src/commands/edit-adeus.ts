import { proto } from "@whiskeysockets/baileys";
import { MessageEdit, GroupsService } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const editAdeus: IChiakiCommand = {
    command: {
        name: "edit-adeus",
        aliases: ["edit-adeus"],
        category: "moderação",
        usage: "edit-adeus <nova mensagem>",
        description: "Edita a mensagem de despedida do grupo.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const newMessage = arg.trim();
        const groupId = M.from;

        if (!newMessage) {
            await M.reply("❗ Você precisa informar a nova mensagem de despedida.");
            return;
        }

        const payload: MessageEdit = {
            groupRemoteJid: groupId,
            messageContent: newMessage
        };

        const result = await GroupsService.editGoodbyeMessage(payload);

        if (typeof result === "string") {
            await M.reply(`⚠️ Erro ao atualizar mensagem de despedida:\n${result}`);
        } else {
            await M.reply("✅ Mensagem de despedida atualizada com sucesso!");
        }
    }
};

export default editAdeus;
