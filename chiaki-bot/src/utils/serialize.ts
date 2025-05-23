import { downloadContentFromMessage, getContentType, jidDecode, proto } from "@whiskeysockets/baileys";
import { ChiakiClient, SerializedMessage } from "../types/types";
import logger from "../logger";

function extractMessageBody(message: any, type: string): string {
    return message?.conversation ||
           message?.[type]?.text ||
           message?.[type]?.caption ||
           (type === 'listResponseMessage' && message?.[type]?.singleSelectReply?.selectedRowId) ||
           (type === 'buttonsResponseMessage' && message?.[type]?.selectedButtonId) ||
           (type === 'templateButtonReplyMessage' && message?.[type]?.selectedId) ||
           '';
}


function extractQuotedText(quotedMsg: any, contentType: string): string {
    return quotedMsg?.[contentType]?.text ||
           quotedMsg?.[contentType]?.description ||
           quotedMsg?.[contentType]?.caption ||
           quotedMsg?.[contentType]?.hydratedTemplate?.hydratedContentText ||
           quotedMsg?.[contentType] || '';
}

async function downloadMedia(message: proto.IMessage): Promise<Buffer> {
    try {
        let contentMessage: any = (message as proto.IWebMessageInfo).message || message;

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
    
        const stream = await downloadContentFromMessage(media, type.replace("Message", "") as any);
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


const decodeJid = (jid: string): string => {
    const { user, server } = jidDecode(jid) || {};
    return user && server ? `${user}@${server}`.trim() : jid;
}
export function serialize(M: proto.IWebMessageInfo, client: ChiakiClient): SerializedMessage {
    if (!M || !M.key || !M.message) {
        return {
            ...M,
            id: '',
            from: '',
            sender: '',
            isGroup: false,
            isSelf: false,
            type: '',
            body: '',
            mentions: [],
            quoted: null,
            reply: async () => {},
            download: async () => Buffer.from([]),
            numbers: [],
            urls: []
        };
    }

    const id = M.key.id ?? '';
    const isSelf = M.key.fromMe ?? false;
    const from = decodeJid(M.key.remoteJid ?? '');
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? decodeJid(M.key.participant ?? '') : (isSelf ? decodeJid(client.user.id) : from);

    let msgContent: any = M.message;
    if (msgContent?.ephemeralMessage) {
        msgContent = msgContent.ephemeralMessage.message;
    }
    if (msgContent?.viewOnceMessageV2) {
        msgContent = msgContent.viewOnceMessageV2.message;
    }

    const type = getContentType(msgContent) ?? '';
    const body = extractMessageBody(msgContent, type);

    let quoted: SerializedMessage['quoted'] = null;
    try {
        const context = msgContent?.[type]?.contextInfo;
        if (context?.quotedMessage) {
            let quotedContent = context.quotedMessage;
            let quotedType = 'normal';

            if (quotedContent?.ephemeralMessage) {
                quotedContent = quotedContent.ephemeralMessage.message;
                quotedType = 'ephemeral';
            }
            if (quotedContent?.viewOnceMessageV2) {
                quotedContent = quotedContent.viewOnceMessageV2.message;
                quotedType = 'view_once';
            }

            const quotedContentType = getContentType(quotedContent) ?? '';
            const participant = decodeJid(context.participant ?? '');

            quoted = {
                type: quotedType,
                stanzaId: context.stanzaId ?? '',
                participant,
                message: quotedContent,
                mtype: quotedContentType,
                isSelf: participant === decodeJid(client.user.id),
                text: extractQuotedText(quotedContent, quotedContentType),
                key: {
                    id: context.stanzaId,
                    fromMe: participant === decodeJid(client.user.id),
                    remoteJid: from
                },
                download: () => downloadMedia(quotedContent)
            };
        }
    } catch (error) {
        client.log.error('Erro ao processar quoted message:', error);
    }

    const mentions: string[] = [];
    if (quoted?.participant) mentions.push(quoted.participant);
    const mentionedJids = msgContent?.[type]?.contextInfo?.mentionedJid ?? [];
    mentions.push(...mentionedJids.filter(Boolean));

    const reply = (text: string, options = {}) =>
        client.sendMessage(from, { text }, { quoted: M, ...options });

    const download = () => downloadMedia(msgContent);

    const numbers = client.utils.extractNumbers(body);
    const urls = client.utils.extractUrls(body);

    return {
        ...M,
        id,
        from,
        sender,
        isGroup,
        isSelf,
        type,
        body,
        mentions,
        quoted,
        reply,
        download,
        numbers,
        urls
    };
}

