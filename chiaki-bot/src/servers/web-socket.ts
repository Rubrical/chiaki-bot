import http from "http";
import logger from "../logger";

import { Server as SocketServer } from 'socket.io';


let serverStarted = false;
const server = http.createServer();
export const io = new SocketServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

export const startWebSocket = () => {
    if (!serverStarted) {
        server.listen(3001, "0.0.0.0", () => {
            logger.info(`Servidor WebSocket rodando na porta 3001!`);
        });

        io.on("connection", (socket) => {
            logger.info('Cliente conectado ao Socket.io');

            socket.on('disconnect', () => {
                logger.info('Cliente desconectado do Socket.io');
            });
        });

        serverStarted = true;
    } else {
        return;
    }
};

export const stopWebSocket = () => {
    if (serverStarted) {
        io.close();
        server.close(() => {
            logger.info("Servidor WebSocket foi fechado.");
        });
        serverStarted = false;
    } else {
        return;
    }
};