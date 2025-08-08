import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const gay: IChiakiCommand = {
    command: {
        name: "gay",
        aliases: ["gay"],
        category: "brincadeiras",
        usage: "gay @usuário",
        description: "Mostra o nível de \"gaydade\" de um membro mencionado.",
    },

    execute: async function (
        client: ChiakiClient,
        flag: string[],
        arg: string,
        M: SerializedMessage,
        rawMessage: proto.IWebMessageInfo[]
    ): Promise<void> {
        const mentionedUser = M.mentions?.[0];
        const percentage = Math.floor(Math.random() * 101);
        const msg = await MessageService.getMessage("joke", "gay");

        if (!mentionedUser) {
            await M.reply("❌ Você precisa mencionar alguém. Ex: /gay @usuário");
            return;
        }

        if (!msg || !msg.mensagem) {
            await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
            return;
        }

        let mediaPayload: any;
        const mediaBuffer = msg.midia ? await MessageService.getMedia(msg.midia) : null;
        const ext = msg.midia ? client.utils.getExtensionFromUrl(msg.midia) : "";
        const text = msg.mensagem
            .replace("{A}", `@${mentionedUser.split("@")[0]}`)
            .replace("{PERCENTAGE}", `${percentage}`);

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
              mentions: [mentionedUser],
            },
            {
              quoted: M
            }
          );
        } catch (err) {
            const now = new Date();
            await client.sendMessage(M.from, {
                text: `Um erro inesperado ocorreu!\nServidor interno fora do ar ou outro erro.\nHorário do erro: ${now.toString()}`,
            });
            client.log.error(`${JSON.stringify(err)}`);
        }
    },
};

export default gay;
