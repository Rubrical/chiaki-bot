import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const divorce: IChiakiCommand = {
  command: {
    name: "divorciar",
    aliases: ["divorciar"],
    category: "brincadeiras",
    usage: "divorciar @usuário",
    description: "Você se divorcia de alguém do grupo.",
  },

  execute: async function (
    client: ChiakiClient,
    flag: string[],
    arg: string,
    M: SerializedMessage,
    rawMessage: proto.IWebMessageInfo[]
  ): Promise<void> {
    if (!M.mentions.length) {
      await M.reply("❌ Você precisa marcar alguém para se divorciar!");
      return;
    }

    const msg = await MessageService.getMessage("joke", "divorciar");

    if (!msg || !msg.mensagem) {
      await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
      return;
    }

    const partner = M.mentions[0];
    const text = msg.mensagem
      .replace("{A}", `@${M.sender.split("@")[0]}`)
      .replace("{B}", `@${partner.split("@")[0]}`);

    const imageBuffer = msg.midia
      ? await MessageService.getMedia(msg.midia)
      : null;

    try {
      await client.sendMessage(
        M.from,
        {
          ...(imageBuffer ? { image: imageBuffer, caption: text } : { text }),
          mentions: [M.sender, partner],
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

export default divorce;
