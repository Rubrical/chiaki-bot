import { proto } from "@whiskeysockets/baileys";
import { GroupsService } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const msgStatus: IChiakiCommand = {
    command: {
        name: "status-mensagens",
        aliases: ["msg-status"],
        category: "moderação",
        usage: "msg-status",
        description: "Mostra se as mensagens de boas-vindas e despedida estão ativas.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const groupId = M.from;
        const result = await GroupsService.verifyMessageStatus(groupId);

        if (typeof result === "string") {
            await M.reply(`⚠️ Erro ao consultar status das mensagens:\n${result}`);
            return;
        }

        const welcome = result.isWelcomeMessageActive ? "✅ Ativada" : "❌ Desativada";
        const goodbye = result.isGoodByeMessageActive ? "✅ Ativada" : "❌ Desativada";

        await M.reply(`📢 *Status das Mensagens:*\n- Boas-vindas: ${welcome}\n- Despedida: ${goodbye}`);
    }
};

export default msgStatus;
