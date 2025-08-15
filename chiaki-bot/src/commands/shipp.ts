import { GroupMetadata, proto } from "@whiskeysockets/baileys";
import { MessageService } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";
import { CacheManager } from "../adapters/cache";

const shipp: IChiakiCommand = {
    command: {
      name: "shipp",
      aliases: ["shipp"],
      category: "brincadeiras",
      usage: "shipp",
      description: "Cria um casal aleatório no grupo.",
    },

    execute: async function (
      client: ChiakiClient,
      flag: string[],
      arg: string,
      M: SerializedMessage,
      rawMessage: proto.IWebMessageInfo[]
    ): Promise<void> {
      let groupMetadata: GroupMetadata = null;
      groupMetadata = await CacheManager.get(`groups:${M.from}`);

      if (!groupMetadata) {
        groupMetadata = await client.groupMetadata(M.from);
        await CacheManager.set(`groups:${M.from}`, groupMetadata, 600);
      }

      const members = groupMetadata.participants.map(p => p.id).filter(id => id !== client.user.id);

      if (members.length < 2) {
        await M.reply("❌ Poucos membros para formar um casal.");
        return;
      }

      let memberA = members[Math.floor(Math.random() * members.length)];
      let memberB = members[Math.floor(Math.random() * members.length)];

      while (memberA === memberB) {
        memberB = members[Math.floor(Math.random() * members.length)];
      }

      const percentage = Math.floor(Math.random() * 101);

      const msg = await MessageService.getMessage("joke", "shipp");
      if (!msg || !msg.mensagem) {
        await M.reply("❌ Mensagem de brincadeira não encontrada no backend.");
        return;
      }

      let mediaPayload: any;
      const mediaBuffer = msg.midia ? await MessageService.getMedia(msg.midia) : null;
      const ext = msg.midia ? client.utils.getExtensionFromUrl(msg.midia) : "";
      const text = msg.mensagem
        .replace("{A}", `@${memberA.split("@")[0]}`)
        .replace("{B}", `@${memberB.split("@")[0]}`)
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
            mentions: [memberA, memberB],
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

export default shipp;