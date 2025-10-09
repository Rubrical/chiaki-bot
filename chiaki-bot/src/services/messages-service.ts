import { api } from "../config/env-config";
import { Message } from "../types/domain";
import { ChiakiError } from "../types/ChiakiError";
import logger from "../logger";
import FormData from "form-data";
import { Buffer } from "node:buffer";

const url = "messages";
const routes = {
    getMessage: (id: string) => `${url}/${id}`,
    attachMedia: (id: number) => `${url}/add-media-to-message/${id}`,
    getMedia: (id: string) => `${url}/upload/${id}`,
}

export const MessageService = {
    getMessage: async (msgType: MessageType, groupName: string): Promise<Message|null> => {
        return await api.get<Message>(routes.getMessage(`${msgType}:${groupName}`))
            .then((data) => data)
            .catch((err) => {
                logger.error(`[Message Service] ${JSON.stringify(err)}`);
                return null;
            });
    },
    attachMediaToMessage: async (
        id: number,
        file: Buffer,
        mimeType: string,
        filename: string
      ): Promise<Message | string> => {
        const form = new FormData();
        form.append("file", file, { contentType: mimeType, filename });

        return await api.patch<Message>(routes.attachMedia(id), form, { headers: form.getHeaders() })
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.warn("[Message Service] Erro ao enviar mídia para a mensagem: " + JSON.stringify(err));
                return err.message;
            });
    },
    getMedia: async (codeMessage: string) => {
      try {
        const response = await api.get(routes.getMedia(codeMessage), { responseType: 'arraybuffer' });
        return Buffer.from(response);
      } catch (err) {
        logger.error("[Message Service] Erro ao resgatar mídia: " + JSON.stringify(err));
        return null;
      }
    }
}


export type MessageType = 'welcome-message' | 'goodbye-message' | 'joke';