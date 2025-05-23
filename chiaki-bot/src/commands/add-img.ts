import { MessageService, MessageType } from "../services/messages-service";
import { IChiakiCommand, ChiakiClient, SerializedMessage } from "../types/types";
import { safeDownloadMedia } from "./sticker";
import mime from "mime-types";


const addImg: IChiakiCommand = {
    command: {
      name: "add-img",
      aliases: ["add-img"],
      category: "moderação",
      usage: "add-img [tipo] (respondendo a imagem/gif)",
      description: "Adiciona uma imagem ou gif a uma mensagem personalizada",
    },

    async execute(client: ChiakiClient, flag: string[], arg: string, M: SerializedMessage): Promise<void> {
        const validTypes: MessageType[] = ["welcome-message", "goodbye-message"];
        const messageType = arg.trim() as MessageType;

        if (!validTypes.includes(messageType)) {
          await M.reply("❌ Tipo inválido. Use 'welcome-message' ou 'goodbye-message'.");
          return;
        }

        if (!M.quoted || !M.quoted.message) {
          await M.reply("❌ Responda a uma imagem ou gif para adicionar à mensagem.");
          return;
        }

        const groupMetadata = await client.groupMetadata(M.from).catch(() => null);
        const groupName = groupMetadata?.subject;

        if (!groupName) {
          await M.reply("❌ Não foi possível identificar o nome do grupo.");
          return;
        }

        const existingMessage = await MessageService.getMessage(messageType, groupName);

        if (!existingMessage || typeof existingMessage === "string") {
          await M.reply("❌ A mensagem ainda não foi criada. Use o comando correspondente para criar antes de adicionar imagem.");
          return;
        }

        const buffer = await safeDownloadMedia(M.quoted);

        if (!buffer || buffer.length === 0) {
          await M.reply("❌ Não foi possível baixar o conteúdo da imagem.");
          return;
        }

        const contentType = Object.keys(M.quoted.message || {})[0];
        const ext = mime.extension((M.quoted.message?.[contentType] as any)?.mimetype || "") || "jpg";
        const filename = `img-${Date.now()}.${ext}`;

        const result = await MessageService.attachMediaToMessage(
          existingMessage.id,
          buffer,
          (M.quoted.message?.[contentType] as any)?.mimetype,
          filename
        );

        if (typeof result === "string") {
          await M.reply(`❌ Erro ao adicionar imagem: ${result}`);
        } else {
          await M.reply("✅ Imagem adicionada com sucesso à mensagem!");
        }
    },
};

export default addImg;