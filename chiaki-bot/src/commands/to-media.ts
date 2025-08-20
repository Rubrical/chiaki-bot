import { proto } from "@whiskeysockets/baileys";
import { ChiakiClient, IChiakiCommand, SerializedMessage } from "../types/types";
import { ensureTempDir, safeDownloadMedia } from "./sticker";
import path from "node:path";
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";


const toMediaCommand: IChiakiCommand = {
    command: {
        name: "tomedia",
        aliases: ["toimg", "tovideo", "tomedia"],
        category: "utilidades",
        usage: "[Marque uma figuinha",
        description: "Converte uma figurinha para imagem ou video"
    },
    async execute(client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage, rawMessage: proto.IWebMessageInfo[]): Promise<void> {
        if (!M.quoted || M.quoted.type !== 'stickerMessage') {
            return await M.reply("❌ Por favor, marque a figurinha que deseja converter.");
        }

        await M.reply("⏱️ Convertendo, aguarde...");
        
        const mediaBuffer = await safeDownloadMedia(M.quoted.message);
        if (!mediaBuffer || mediaBuffer.length === 0) {
            return M.reply("❌ Falha ao baixar a mídia da figurinha.");
        }

        const isAnimated = M.quoted.message?.stickerMessage?.isAnimated ?? false;
        const tempDir = ensureTempDir();
        const inputPath = path.join(tempDir, `input_${Date.now()}.webp`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.${isAnimated ? 'mp4' : 'png'}`);

        try {
            await fs.writeFile(inputPath, mediaBuffer);

            await new Promise<void>((resolve, reject) => {
                ffmpeg(inputPath)
                    .output(outputPath)
                    .on("end", resolve)
                    .on("error", reject)
                    .run();
            });

            const outputBuffer = await fs.readFile(outputPath);

            if (isAnimated) {
                await client.sendMessage(M.from, { video: outputBuffer, gifPlayback: true }, { quoted: M });
            } else {
                await client.sendMessage(M.from, { image: outputBuffer }, { quoted: M });
            }
        } catch (error) {
            client.log.error("Erro ao converter figurinha:", error);
            await M.reply("❌ Ocorreu um erro durante a conversão.");
        } finally {
            await fs.unlink(inputPath).catch(e => client.log.warn("Falha ao limpar inputPath"));
            await fs.unlink(outputPath).catch(e => client.log.warn("Falha ao limpar outputPath"));
        }
    }
}

export default toMediaCommand;