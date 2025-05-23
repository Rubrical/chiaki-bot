import { proto } from "@whiskeysockets/baileys";
import { GroupsService } from "../services/group-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const rank: IChiakiCommand = {
    command: {
        name: "rank",
        aliases: ["rank"],
        category: "geral",
        usage: "rank [quantidade]",
        description: "Exibe o ranking dos usuários mais ativos do grupo.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const groupId = M.from;
        const qty = Number(arg.trim()) || undefined;

        const result = await GroupsService.usersRank(groupId, qty);

        if (typeof result === "string") {
            await M.reply(`⚠️ Erro ao consultar o ranking:\n${result}`);
            return;
        }

        if (!Array.isArray(result) || result.length === 0) {
            await M.reply("⚠️ Nenhum dado de ranking encontrado.");
            return;
        }

        const ranking = result
            .map((user, index) =>
                `${index + 1}. ${user.nome} - ${user.quantidadeMensagens} mensagens - ${user.comandosExecutados} comandos`
            )
            .join("\n");

        await M.reply(`🏆 *Ranking dos mais ativos:*\n\n${ranking}`);
    }
};

export default rank;
