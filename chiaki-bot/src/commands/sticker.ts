import { IChiakiCommand } from "../types/types";
import fs from "fs";
import path from "path";
import logger from "../logger";
import {
  downloadContentFromMessage,
  getContentType,
  proto,
} from "@whiskeysockets/baileys";
import { createSticker } from "../utils/sticker-utils";
import { StickerError } from "../types/sticker-error";


export async function safeDownloadMedia(
  message: proto.IWebMessageInfo | proto.IMessage
): Promise<Buffer | null> {
  try {
    let contentMessage: any =
      (message as proto.IWebMessageInfo).message || message;

    if (!contentMessage) {
      return null;
    }

    if (contentMessage.ephemeralMessage) {
      contentMessage = contentMessage.ephemeralMessage.message;
    }

    if (contentMessage.viewOnceMessageV2) {
      contentMessage = contentMessage.viewOnceMessageV2.message;
    }

    const type = getContentType(contentMessage);
    if (!type) {
      return null;
    }

    const media = contentMessage[type];

    if (!media || !media.url || !media.mediaKey || !media.directPath) {
      return null;
    }

    const stream = await downloadContentFromMessage(
      media,
      type.replace("Message", "") as any
    );
    const bufferArray: Buffer[] = [];

    for await (const chunk of stream) {
      bufferArray.push(chunk);
    }

    return Buffer.concat(bufferArray);
  } catch (error) {
    logger.error(`Erro ao baixar mídia: ${JSON.stringify(error)}`);
    return Buffer.from([]);
  }
}


export function ensureTempDir(): string {
  const tempDir = path.join(__dirname, "..", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

const stickerCommand: IChiakiCommand = {
  command: {
    name: "sticker",
    aliases: ["s", "figurinha", "stiker", "f"],
    category: "utilidades",
    usage: "[marque mídia] |Nome Pacote|Autor",
    description: "Converte imagens, vídeos e GIFs em figurinhas",
  },

  async execute(client, flag, arg, M) {
    const tempDir = ensureTempDir();
    logger.info("Executando comando de sticker...");

    await M.reply("⏱️ Aguarde a criação do seu sticker").catch(e =>
      logger.warn("Erro ao enviar mensagem de espera: ", JSON.stringify(e))
    );

    const mediaMessage = M.quoted?.message || M.message;
    const actualType = getContentType(mediaMessage) ?? "";
    const supportedTypes = ["imageMessage", "videoMessage", "stickerMessage"];

    logger.info("Tipo detectado da mídia:", actualType);

    if (!supportedTypes.includes(actualType)) {
      logger.warn("Tipo de mídia não suportado:", actualType);
      return M.reply("❌ *Envie ou marque uma imagem, vídeo ou GIF*.");
    }

    const parts = arg.split("|");
    const packName = parts[1]?.trim() || `${client.config.name} 1.1`;
    const authorName = parts[2]?.trim() || client.config.name;
    const mediaBuffer = await safeDownloadMedia(M.quoted ?? M);

    if (!mediaBuffer || mediaBuffer.length === 0) {
      logger.warn("Buffer vazio ou mídia indisponível para download");
      return M.reply("❌ Não consegui baixar a mídia. Talvez tenha expirado ou sido apagada.");
    }

    try {
      const stickerBuffer = await createSticker(mediaBuffer, {
        pack: packName,
        author: authorName,
        fps: 9,
        type: 'resize'
      });

      await client.sendMessage(M.from, { sticker: stickerBuffer }, { quoted: M });
      logger.info("Figurinha enviada com sucesso.");
    } catch (error: any) {
      if (error instanceof StickerError) {
        logger.warn(`Erro específico de figurinha: ${JSON.stringify(error)}`);
        await M.reply(`${error.message}`);
      } else {
        logger.error("Erro na criação do sticker:", error);
        await M.reply("❌ Ocorreu um erro ao criar a figurinha. Tente novamente.");
      }
    }
  },
};

export default stickerCommand;
