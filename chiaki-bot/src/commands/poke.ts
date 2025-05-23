import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const poke: IChiakiCommand = {
  command: {
    name: "cutucar",
    aliases: ["cutucar"],
    category: "brincadeiras",
    usage: "cutucar @usuário",
    description: "Cutuca alguém do grupo.",
  },

  execute: async function (
    client: ChiakiClient,
    flag: string[],
    arg: string,
    M: SerializedMessage,
    rawMessage: proto.IWebMessageInfo[]
  ): Promise<void> {
    const msg = await MessageService.getMessage("joke", "cutucar");

    if (!msg || !msg.mensagem) {
      await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
      return;
    }

    const mentioned = M.mentions[0];
    if (!mentioned) {
      await M.reply("⚠️ Você precisa mencionar alguém para cutucar.");
      return;
    }

    const senderTag = `@${M.sender.split("@")[0]}`;
    const targetTag = `@${mentioned.split("@")[0]}`;
    const text = msg.mensagem
      .replace("{A}", senderTag)
      .replace("{B}", targetTag);

    const media = msg.midia ? await MessageService.getMedia(msg.midia) : null;

    try {
      await client.sendMessage(
        M.from,
        {
          ...(media ? { image: media, caption: text } : { text }),
          mentions: [M.sender, mentioned],
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

export default poke;
