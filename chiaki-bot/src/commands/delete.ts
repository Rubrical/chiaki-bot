import { IChiakiCommand } from "../types/types";

const deleteMessage: IChiakiCommand = {
  command: {
    name: "delete",
    aliases: ["del"],
    category: "moderação",
    usage: "del (responda a mensagem)",
    description: "Deleta a mensagem especificada (responder/quotar).",
  },

  async execute(client, flag, arg, M) {
    if (!M.quoted?.message?.extendedTextMessage?.contextInfo) {
      await M.reply("🟥 *Responda a mensagem que você quer apagar!*");
      return;
    }

    const context = M.quoted.message.extendedTextMessage.contextInfo;

    await client.sendMessage(M.from, {
      delete: {
        remoteJid: M.from,
        fromMe: false,
        id: context.stanzaId!,
        participant: context.participant!,
      },
    });
  },
};

export default deleteMessage;
