import { proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";

const gay: IChiakiCommand = {
    command: {
      name: "gay",
      aliases: ["gay"],
      category: "brincadeiras",
      usage: "gay",
      description: "Mostra o nível de gaydade de um membro aleatório.",
    },

    execute: async function (
      client: ChiakiClient,
      flag: string[],
      arg: string,
      M: SerializedMessage,
      rawMessage: proto.IWebMessageInfo[]
    ): Promise<void> {
      const groupMetadata = await client.groupMetadata(M.from);
      const members = groupMetadata.participants.map(p => p.id).filter(id => id !== client.user.id);
      const randomMember = members[Math.floor(Math.random() * members.length)];
      const percentage = Math.floor(Math.random() * 101);
      const msg = await MessageService.getMessage("joke", "gay");

      if (!msg || !msg.mensagem) {
        await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
        return;
      }

      const imageBuffer = msg.midia ? await MessageService.getMedia(msg.midia) : null;
      const text = msg.mensagem
        .replace("{A}", `@${randomMember.split("@")[0]}`)
        .replace("{PERCENTAGE}", `${percentage}`);

      try {
        await client.sendMessage(
          M.from,
          {
            ...(imageBuffer
              ? {
                  image: imageBuffer,
                  caption: text,
                }
              : {
                  text,
                }),
            mentions: [randomMember],
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

export default gay;