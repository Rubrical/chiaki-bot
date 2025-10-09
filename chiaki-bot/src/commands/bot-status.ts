import { proto } from "@whiskeysockets/baileys";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";

const botStatus: IChiakiCommand = {
    command: {
        name: "bot-status",
        aliases: ["bot", "bot-status"],
        category: "moderação",
        usage: "bot",
        description: "Verifica o estado atual do bot."
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        await M.reply(
            `*Informações do Bot:*\n🤖 Nome do Bot: ${client.config.name}\n👑 Dono: ${client.config.botRoot}\n#️⃣ Prefixo: ${client.config.prefix}\n🧪 Ambiente de execução: ${client.config.environment}\n`
        );
    }
};
export default botStatus;