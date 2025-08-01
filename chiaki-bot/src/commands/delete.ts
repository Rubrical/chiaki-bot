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
    if (!M.quoted) {
      await M.reply("🟥 *Responda a mensagem que você quer apagar!*");
      return;
    }

    const isGroup = M.isGroup;
    const key = M.quoted.key;

    if (isGroup) {
      const metadata = await client.groupMetadata(M.from);
      const botNumber = client.user.id.split(":")[0] + "@s.whatsapp.net";
      const sender = M.sender;
      const botInfo = metadata.participants.find((x) => x.id === botNumber);
      const senderInfo = metadata.participants.find((x) => x.id === sender);
      const isBotAdmin = botInfo?.admin === "admin";
      const isSenderAdmin = senderInfo?.admin === "admin" || senderInfo?.admin === "superadmin";

      if (!isBotAdmin) {
        await M.reply(`🟥 *Não posso apagar mensagens, não sou admin nesse grupo.*`);
        return;
      }

      if (!isSenderAdmin) {
        await M.reply(`🟥 *Apenas administradores podem executar este comando!*`);
        return;
      }
    }

    await client.sendMessage(M.from, {
      delete: {
        remoteJid: M.from,
        fromMe: key.fromMe!,
        id: key.id!,
        participant: M.quoted.participant,
      },
    });
  },};

export default deleteMessage;
