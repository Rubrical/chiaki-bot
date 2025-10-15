import { ILogger } from '@whiskeysockets/baileys/lib/Utils/logger';
import { Logger as WinstonLogger } from 'winston';

interface BaileysLogger {
    info(obj: any, msg?: string): void;
    warn(obj: any, msg?: string): void;
    error(obj: any, msg?: string): void;
    debug(obj: any, msg?: string): void;
    trace(obj: any, msg?: string): void;
    child(bindings: { [key: string]: any }): BaileysLogger;
    level: string;
}


export function createWinstonAdapter(logger: WinstonLogger): BaileysLogger {
    const formatMessage = (obj: any, msg?: string): string => {
        if (typeof obj === 'string') {
            return obj;
        }
        const message = msg ? ` ${msg}` : '';
        return `${JSON.stringify(obj)}${message}`;
    };

    return {
        info: (obj, msg) => logger.info(formatMessage(obj, msg)),
        warn: (obj, msg) => logger.warn(formatMessage(obj, msg)),
        error: (obj, msg) => logger.error(formatMessage(obj, msg)),
        debug: (obj, msg) => logger.debug(formatMessage(obj, msg)),
        trace: (obj, msg) => logger.verbose(formatMessage(obj, msg)),
        child: () => createWinstonAdapter(logger),
        level: '',
    };
}