import { proto } from "@whiskeysockets/baileys";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";
import { ensureTempDir, safeDownloadMedia } from "./sticker";
import path from "node:path";
import fs from "fs/promises";
import { exec } from "child_process";
import logger from "../logger";
import isAnimated from "is-animated";

const execAsync = (command: string) => {
  return new Promise<void>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`[Comandos] Erro ao executar comando. Código: ${error.code}`);
        logger.error(`[Comandos] Comando stderr: ${stderr}`);
        return reject(error);
      }
      resolve();
    });
  });
};

const toMediaCommand: IChiakiCommand = {
  command: {
    name: "tomedia",
    aliases: ["toimg", "tovideo"],
    category: "utilidades",
    usage: "[Marque uma figurinha]",
    description: "Converte uma figurinha para imagem ou vídeo"
  },
  async execute(client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
    if (!M.quoted || M.quoted.mtype !== 'stickerMessage') {
      return await M.reply("❌ Por favor, marque a figurinha que deseja converter.");
    }

    await M.reply("⏱️ Convertendo, aguarde...");

    const mediaBuffer = await safeDownloadMedia(M.quoted.message);
    if (!mediaBuffer || mediaBuffer.length === 0) {
      return M.reply("❌ Falha ao baixar a mídia da figurinha.");
    }

    const isAnimatedCheck = isAnimated(mediaBuffer);
    const tempDir = ensureTempDir();
    const inputPath = path.join(tempDir, `input_${Date.now()}.webp`);
    const gifPath = path.join(tempDir, `intermediate_${Date.now()}.gif`); // Caminho para o GIF intermediário
    const outputPath = path.join(tempDir, `output_${Date.now()}.${isAnimatedCheck ? 'mp4' : 'png'}`);

    try {
      await fs.writeFile(inputPath, mediaBuffer);

      if (isAnimatedCheck) {
        logger.info("[Comandos] Etapa 1: Convertendo WebP para GIF...");
        const convertCommand = `convert "${inputPath}" "${gifPath}"`;
        await execAsync(convertCommand);

        logger.info("[Comandos] Etapa 2: Convertendo GIF para MP4...");
        const ffmpegCommand = `ffmpeg -i "${gifPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -an "${outputPath}"`;
        await execAsync(ffmpegCommand);
      } else {
        const ffmpegCommand = `ffmpeg -i "${inputPath}" "${outputPath}"`;
        await execAsync(ffmpegCommand);
      }

      const outputBuffer = await fs.readFile(outputPath);

      if (isAnimatedCheck) {
        await client.sendMessage(M.from, { video: outputBuffer, gifPlayback: true }, { quoted: M });
      } else {
        await client.sendMessage(M.from, { image: outputBuffer }, { quoted: M });
      }
    } catch (error) {
      client.log.error("[Comandos] Erro ao converter figurinha:", error);
      await M.reply("❌ Ocorreu um erro durante a conversão.");
    } finally {
      await fs.unlink(inputPath).catch(e => client.log.warn("[Comandos] Falha ao limpar inputPath"));
      await fs.unlink(outputPath).catch(e => client.log.warn("[Comandos] Falha ao limpar outputPath"));
      if (isAnimatedCheck) {
        await fs.unlink(gifPath).catch(e => client.log.warn("[Comandos] Falha ao limpar gifPath intermediário"));
      }
    }
  }
}

export default toMediaCommand;