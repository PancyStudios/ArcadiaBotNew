import { Router } from "express";

export const MainRouter = Router()

MainRouter.get('/', (_req, res) => {
    res.send(`Servidor Web Iniciado\n\nTranscripts en /transcripts/:id`)
})