import express, { Express, Request, Response } from 'express';
import { ChiakiClient } from '../types/types';
import logger from '../logger';

export const startWebServer = (client: ChiakiClient) => {
    const app: Express = express();
    const port = 3002;

    app.use(express.json());

    app.get('/status', (req: Request, res: Response) => {
        res.status(200).json(client.config);
    });

    app.post('/send-private-message', async (req, res) => {
        const { to, message } = req.body;

        if (!to || !message) {
            res.status(400).json({ error: 'Parâmetros "to" e "message" são obrigatórios.' });
            return;
        }

        try {
            await client.sendMessage(`${to}@s.whatsapp.net`, { text: message });
            logger.info(`[Bot-Server] Mensagem enviada para ${to} via API.`);
            res.status(200).json({ success: true, message: 'Mensagem enviada.' });

            return;
        } catch (error) {
            logger.error(`[Bot-Server] Erro ao enviar mensagem via API: ${error}`);
            res.status(500).json({ success: false, error: 'Falha ao enviar mensagem.' });

            return;
        }
    });


    app.listen(port, "0.0.0.0", () => {
        logger.info(`[Bot-Server] Servidor HTTP rodando na porta ${port}!`);
    });
};