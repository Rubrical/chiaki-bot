import { proto } from "@whiskeysockets/baileys";
import { BanService } from "../services/ban-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";


const unbanUser: IChiakiCommand = {
    command: {
        name: "unban",
        aliases: ["unban"],
        category: "moderação",
        usage: "unban @99999999",
        description: "Remove o banimento de um usuário pelo ID do ban.",
    },
    execute: async function (client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        const groupId = M.from;
        const mentionedUser = M.mentions?.[0];
        let remoteJid: string | null = null;

        if (!M.isGroup) {
            await M.reply("Este comando só pode ser usado em grupos.");
            return;
        }

        if (mentionedUser) {
            remoteJid = client.utils.validateRemoteJid(mentionedUser).phoneNumber;
        } else if (arg) {
            const cleanArg = arg.replace(/\D/g, "");
            remoteJid = client.utils.validateRemoteJid(cleanArg).phoneNumber;
        } else {
            await M.reply("Você precisa marcar ou informar o número do usuário para desbanir.");
            return;
        }

        const result = await BanService.remove(remoteJid, groupId);

        if (typeof result === "string") {
            await M.reply(result);
        } else if (result) {
            await M.reply("Usuário desbanido com sucesso.");
        } else {
            await M.reply("Erro ao desbanir o usuário.");
        }
    }
};

export default unbanUser