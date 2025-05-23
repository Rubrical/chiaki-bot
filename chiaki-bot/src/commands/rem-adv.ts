import { proto } from "@whiskeysockets/baileys";
import { AdvertenceService } from "../services/advertence-service";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";

const removeAdvertence: IChiakiCommand = {
    command: {
        name: "rem-adv",
        aliases: ["rem-adv"],
        category: "moderação",
        usage: "rem-adv @9999999999",
        description: "Remove uma advertência do usuário especificado.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const mentionedUser = M.mentions?.[0];
        const remoteJid = client.utils.validateRemoteJid(mentionedUser).phoneNumber;

        if (!M.isGroup) {
            await M.reply("Este comando só pode ser usado em grupos.");
            return;
        }

        if (!mentionedUser) {
            await M.reply("Você precisa marcar um usuário para remover advertência.");
            return;
        }

        const response = await AdvertenceService.remove({
            userRemoteJid: remoteJid,
            whatsappGroupId: M.from,
            activeAdvertences: true,
        });

        if (typeof response === "string") {
            await M.reply(`Não foi possível remover a advertência: ${response}`);
        } else if (response) {
            await M.reply("Advertência removida com sucesso.");
        } else {
            await M.reply("Erro ao remover a advertência.");
            client.log.error(`Erro ao remover advertência para ${mentionedUser} no grupo ${M.from}`);
        }
    }
};

export default removeAdvertence;