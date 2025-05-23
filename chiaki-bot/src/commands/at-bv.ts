import { proto } from "@whiskeysockets/baileys";
import { GroupsService } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const atBv: IChiakiCommand = {
    command: {
        name: "at-bv",
        aliases: ["at-bv"],
        category: "moderação",
        usage: "at-bv 1 (ativa) ou at-bv 0 (desativa)",
        description: "Ativa ou desativa as mensagens de boas-vindas no grupo.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const option = arg.trim();
        const groupId = M.from;

        if (option !== "0" && option !== "1") {
            await M.reply("Use 1 para ativar ou 0 para desativar as boas-vindas.");
            return;
        }

        const result = option === "1"
            ? await GroupsService.activateWelcome(groupId)
            : await GroupsService.inactivateWelcome(groupId);

        await M.reply(result);
    }
};

export default atBv;
