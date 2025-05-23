import fs from 'fs-extra';
import express from "express";
import { Request, Response } from "express";
import logger from "../logger";
import path from "path";

const sessionPath = path.resolve(__dirname, "../../session");
const app = express();

app.get('/test', (_req: Request, res: Response) => {
    res.status(200).send("Teste testado com sucesso");
});

app.delete('/logout', async (_req: Request, res: Response) => {
    try {
        await fs.remove(sessionPath);
        logger.info("Sessão removida com sucesso. Reiniciando...");
        res.status(200).send("Sessão removida com sucesso.");
        process.exit(0);
    } catch (err) {
        logger.error("Erro ao remover a sessão: ", err);
        res.status(500).send("Erro ao remover a sessão.");
    }
});

app.listen(3002, () => logger.info("Servidor de controle rodando na porta 3002"));
