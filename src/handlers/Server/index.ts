import express from 'express'

export class ServerWeb {
    private app = express()
    private port: number

    constructor(PORT: number) {
        this.app = express()
        this.port = PORT
        this.start()
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Servidor Web Iniciado en ${this.port}`, 'WEB')
        })

        this.app.get('/', (_req, res) => {
            res.send(`Servidor Web Iniciado en ${this.port}\n\nTranscripts en /transcripts/:id`)
        })
    }
}