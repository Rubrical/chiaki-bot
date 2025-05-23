import { createLogger, format, transports, Logger } from 'winston';
import fs from 'fs';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

const logDirectory: string = path.join(__dirname, '../logs/');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logFormat = printf(({ level, message, timestamp }) => `${timestamp} [${level}: ${message}]`);

const logger: Logger = createLogger({
    format: combine(
        timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({
            format: combine(colorize(), logFormat)
        }),
        new transports.File({
            format: combine(logFormat),
            filename: path.join(logDirectory, 'app.log')
        })
    ]
});

logger.add(new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }));

export default logger;
