import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const rich: IChiakiCommand = {
    command: {
      name: "rico",
      aliases: ["rico"],
      category: "brincadeiras",
      usage: "rico",
      description: "Descubra quanto dinheiro alguém teria.",
    },

    execute: async function (
      client: ChiakiClient,
      flag: string[],
      arg: string,
      M: SerializedMessage,
      rawMessage: proto.IWebMessageInfo[]
    ): Promise<void> {
      const msg = await MessageService.getMessage("joke", "rico");

      if (!msg || !msg.mensagem) {
        await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
        return;
      }

      let mediaPayload: any;
      const percentage = Math.floor(Math.random() * 101);
      const mediaBuffer = msg.midia ? await MessageService.getMedia(msg.midia) : null;
      const ext = msg.midia ? client.utils.getExtensionFromUrl(msg.midia) : "";
      const text = msg.mensagem
        .replace("{A}", `@${M.sender.split("@")[0]}`)
        .replace("{PERCENTAGE}", percentage.toString());

      if (mediaBuffer) {
        if (ext === "mp4") {
          mediaPayload = {
            gifPlayback: true,
            video: mediaBuffer,
            caption: text,
          };
        } else {
          mediaPayload = {
            image: mediaBuffer,
            caption: text,
          };
        }
      } else {
        mediaPayload = {text};
      }

      try {
        await client.sendMessage(
          M.from,
          {
            ...mediaPayload,
            mentions: [M.sender],
          },
          {
            quoted: M
          }
        );
      } catch(err) {
        const now = new Date(Date.now());
        await client.sendMessage(M.from, { text: `Um erro inesperado ocorreu!\n Servidor interno fora do ar ou outro erro.\n Horário do erro ${now.toString()}`});
        client.log.error(`[Comandos] ${JSON.stringify(err)}`);
      }
    },
  };

export default rich;