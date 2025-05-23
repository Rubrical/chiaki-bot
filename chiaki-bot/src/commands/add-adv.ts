import { proto } from "@whiskeysockets/baileys";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";
import { AdvertenceService } from "../services/advertence-service";

const addAdvertence: IChiakiCommand = {
    command: {
        name: "add-adv",
        aliases: ["add-adv"],
        category: "moderação",
        usage: "add-adv @9999999999 (motivo)",
        description: "Adiciona uma advertência ao usuário especificado. Limite de 3 advertências",
    },
    async execute(client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const mentionedUser = M.mentions?.[0];
        const remoteJid = client.utils.validateRemoteJid(mentionedUser).phoneNumber;
        const cleanedArg = arg.replace(/@\d+\s*/, '').trim();
        const reason = cleanedArg || "Sem motivo informado";

        if (!M.isGroup) {
            await M.reply("Este comando só pode ser usado em grupos.");
            return;
        }

        if (!mentionedUser) {
            await M.reply("Você precisa marcar um usuário para advertir.");
            return;
        }

        const response = await AdvertenceService.add({
            userRemoteJid: remoteJid,
            whatsappGroupId: M.from,
            reason: reason,
        });

        if (typeof response === "string") {
            await M.reply(`Não foi possível advertir: ${response}`);
        } else if (response) {
            await M.reply(`@${remoteJid} foi advertido. Motivo:\n${reason}`);
        } else {
            await M.reply("Erro ao advertir o usuário.");
            client.log.error(`Erro ao adicionar advertência para ${mentionedUser} no grupo ${M.from}`);
        }
    }
}
export default addAdvertence;