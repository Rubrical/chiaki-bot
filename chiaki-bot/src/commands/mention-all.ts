import { IChiakiCommand } from "../types/types";

const mentionAll: IChiakiCommand = {
  command: {
    name: "mention-all",
    aliases: ["totag"],
    category: "moderação",
    usage: "totag {mensagem}",
    description: "Menciona todos os membros do grupo de uma só vez.",
  },

  async execute(client, flag, arg, M, rawMessage) {
    if (!M.isGroup) return;

    const groupData = await client.groupMetadata(M.from);
    const admNumber = M.sender.split("@")[0];
    const admPushName = M.pushName;
    const whoMentioned = `Menção do ADM ${admPushName} @${admNumber}`;
    const members = groupData.participants.map((x) => x.id) || [];

    let mentionMessage = "";

    if (M.body?.startsWith(`${client.config.prefix}totag`)) {
      mentionMessage = M.body.replace(`${client.config.prefix}totag`, "").trim();
    } else if (M.quoted?.text) {
      mentionMessage = M.quoted.text.trim();
    }

    if (!mentionMessage) {
      await M.reply("🟥 *Mencione uma mensagem com seu aviso ou digite o comando com o aviso*");
      return;
    }

    await client.sendMessage(M.from, {
      text: `${whoMentioned}\n${mentionMessage}`,
      mentions: members,
    });
  },
};

export default mentionAll;
