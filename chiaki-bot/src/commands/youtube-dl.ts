import { IChiakiCommand } from "../types/types";
import ytdl from "ytdl-core";
import yts from "yt-search";
import logger from "../logger";

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const MAX_VIDEO_SIZE_MB = 100;

const youtubeDlCommand: IChiakiCommand = {
    command: {
        name: "youtube",
        aliases: ["yt", "play"],
        category: "utilidades",
        usage: "",
        description: "Baixa um vídeo do YouTube de até no máximo 100MB e o envia.",
    },

    async execute(client, flag, arg, M) {
        if (!arg) {
            return M.reply("❌ Forneça a URL de um vídeo do YouTube ou um termo para busca.");
        }

        await M.reply("🔎 Buscando e baixando o vídeo, aguarde...");

        try {
            let videoUrl: string;

            if (YOUTUBE_URL_REGEX.test(arg)) {
                videoUrl = arg;
            } else {
                const searchResult = await yts(arg);
                const video = searchResult.videos[0];
                if (!video) {
                    return M.reply("❌ Nenhum vídeo encontrado para sua busca.");
                }
                videoUrl = video.url;
            }

            const videoInfo = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(videoInfo.formats, { 
                quality: 'lowestvideo',
                filter: format => format.hasAudio && format.container === 'mp4'
            });

            if (!format) {
                return M.reply("❌ Não foi encontrado um formato de vídeo compatível (MP4 com áudio).");
            }
            
            const videoSize = parseInt(format.contentLength, 10);
            if (videoSize > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                 return M.reply(`❌ O vídeo é muito grande (${(videoSize / 1024 / 1024).toFixed(2)} MB). O limite é de ${MAX_VIDEO_SIZE_MB} MB.`);
            }

            const videoStream = ytdl(videoUrl, { format });
            
            const chunks: Buffer[] = [];
            for await (const chunk of videoStream) {
                chunks.push(chunk);
            }
            const videoBuffer = Buffer.concat(chunks);
            
            await client.sendMessage(M.from, { 
                video: videoBuffer, 
                caption: `🎬 *Título:* ${videoInfo.videoDetails.title}` 
            }, { quoted: M });

        } catch (error) {
            logger.error("Erro no comando YouTube:", error);
            await M.reply("❌ Ocorreu um erro ao buscar ou baixar o vídeo. Verifique a URL ou tente novamente.");
        }
    },
};

export default youtubeDlCommand;