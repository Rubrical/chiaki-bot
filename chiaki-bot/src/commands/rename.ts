import logger from "../logger";
import { IChiakiCommand } from "../types/types";
import { addExif } from "../utils/sticker-utils";
import { safeDownloadMedia } from "./sticker";

const renameStickerCommand: IChiakiCommand = {
    command: {
        name: "rename",
        aliases: ["rename", "renomear", "roubar"],
        category: "utilidades",
        usage: "[marque a figurinha] |Nome Pacote |Autor",
        description: "Renomeia uma figurinha com um novo pacote e autor.",
    },

    async execute(client, flag, arg, M) {
        if (!M.quoted || M.quoted.type !== 'stickerMessage') {
            return await M.reply("❌ Por favor, marque a figurinha que deseja renomear.");
        }

        await M.reply("⏱️ Renomeando figurinha...");

        const mediaBuffer = await safeDownloadMedia(M.quoted.message);
        if (!mediaBuffer || mediaBuffer.length === 0) {
            return M.reply("❌ Falha ao baixar a mídia da figurinha.");
        }

        const parts = arg.split("|");
        const packName = parts[0]?.trim() || `${client.config.name}`;
        const authorName = parts[1]?.trim() || "ChiakiBot 2.0";

        try {
            const stickerBuffer = await addExif(mediaBuffer, packName, authorName);
            await client.sendMessage(M.from, { sticker: stickerBuffer }, { quoted: M });
        } catch (error) {
            logger.error("Erro ao renomear figurinha:", error);
            await M.reply("❌ Ocorreu um erro ao aplicar os novos dados à figurinha.");
        }
    },
};

export default renameStickerCommand;