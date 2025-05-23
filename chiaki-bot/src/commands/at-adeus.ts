import { proto } from "@whiskeysockets/baileys";
import { GroupsService } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const atAdeus: IChiakiCommand = {
    command: {
        name: "at-adeus",
        aliases: ["at-adeus"],
        category: "moderação",
        usage: "at-adeus 1 (ativa) ou at-adeus 0 (desativa)",
        description: "Ativa ou desativa as mensagens de despedida no grupo.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const option = arg.trim();
        const groupId = M.from;

        if (option !== "0" && option !== "1") {
            await M.reply("Use 1 para ativar ou 0 para desativar as mensagens de adeus.");
            return;
        }

        const result = option === "1"
            ? await GroupsService.activateGoodbye(groupId)
            : await GroupsService.inactivateGoodbye(groupId);

        await M.reply(result);
    }
};

export default atAdeus;
