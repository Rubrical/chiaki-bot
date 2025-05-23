import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const hottie: IChiakiCommand = {
  command: {
    name: "gostosa",
    aliases: ["gostosa"],
    category: "brincadeiras",
    usage: "gostosa [@usuário]",
    description: "Mostra o nível de gostosura de alguém.",
  },

  execute: async function (
    client: ChiakiClient,
    flag: string[],
    arg: string,
    M: SerializedMessage,
    rawMessage: proto.IWebMessageInfo[]
  ): Promise<void> {
    const msg = await MessageService.getMessage("joke", "gostosa");

    if (!msg || !msg.mensagem) {
      await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
      return;
    }

    let targetJid = M.mentions[0];

    // Caso não haja menção, buscar membro aleatório do grupo
    if (!targetJid) {
      const metadata = await client.groupMetadata(M.from).catch(() => null);
      if (!metadata) {
        await M.reply("❌ Não foi possível obter os membros do grupo.");
        return;
      }

      const participants = metadata.participants.filter(
        (p) => p.id !== client.user.id
      );
      const randomUser =
        participants[Math.floor(Math.random() * participants.length)];
      if (!randomUser) {
        await M.reply("❌ Grupo sem participantes válidos.");
        return;
      }

      targetJid = randomUser.id;
    }

    const percentage = Math.floor(Math.random() * 101);
    const text = msg.mensagem
      .replace("{A}", `@${targetJid.split("@")[0]}`)
      .replace("{PERCENTAGE}", String(percentage));

    const imageBuffer = msg.midia
      ? await MessageService.getMedia(msg.midia)
      : null;

    try {
      await client.sendMessage(
        M.from,
        {
          ...(imageBuffer ? { image: imageBuffer, caption: text } : { text }),
          mentions: [targetJid],
        },
        { quoted: M }
      );
    } catch(err) {
      const now = new Date(Date.now());
      await client.sendMessage(M.from, { text: `Um erro inesperado ocorreu!\n Servidor interno fora do ar ou outro erro.\n Horário do erro ${now.toString()}`});
      client.log.error(`${JSON.stringify(err)}`);
    }
  },
};

export default hottie;
