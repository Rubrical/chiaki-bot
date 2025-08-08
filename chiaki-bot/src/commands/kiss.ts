import { proto } from "@whiskeysockets/baileys";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";
import { MessageService } from "../services/messages-service";


const kiss: IChiakiCommand = {
    command: {
      name: "beijar",
      aliases: ["beijar"],
      category: "brincadeiras",
      usage: "beijar @usuário",
      description: "Beija outro usuário do grupo.",
    },

    execute: async function (
      client: ChiakiClient,
      flag: string[],
      arg: string,
      M: SerializedMessage,
      rawMessage: proto.IWebMessageInfo[]
    ): Promise<void> {
      const mentioned = M.mentions?.[0];

      if (!mentioned) {
        await M.reply("🚫 Você precisa marcar alguém para beijar!");
        return;
      }

      const msg = await MessageService.getMessage("joke", "beijar");

      if (!msg || !msg.mensagem) {
        await M.reply("❌ Mensagem de brincadeira não encontrada no Servidor.");
        return;
      }

      let mediaPayload: any;
      const mediaBuffer = msg.midia ? await MessageService.getMedia(msg.midia) : null;
      const ext = msg.midia ? client.utils.getExtensionFromUrl(msg.midia) : "";
      const text = `${msg.mensagem} @${mentioned.split("@")[0]}`;

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
            mentions: [mentioned],
          },
          {
            quoted: M
          }
        );
      } catch(err) {
        const now = new Date(Date.now());
        await client.sendMessage(M.from, { text: `Um erro inesperado ocorreu!\n Servidor interno fora do ar ou outro erro.\n Horário do erro ${now.toString()}`});
        client.log.error(`${JSON.stringify(err)}`);
      }
    },
  };

export default kiss;