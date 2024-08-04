import express from 'express'
import { MainRouter } from './Routes/Main'
import { TranscriptsRouter } from './Routes/Transcripts'
import { Server, IncomingMessage, ServerResponse } from 'http'

export class ServerWeb {
    private app = express()
    private port: number
    private server: Server<typeof IncomingMessage, typeof ServerResponse>

    constructor(PORT: number) {
        this.app = express()
        this.port = PORT
        this.start()
        
    }

    public start() {
        this.app.use('/', MainRouter)
        this.app.use('/transcripts', TranscriptsRouter)
        this.server = this.app.listen(this.port, () => {
            console.log('Servidor iniciado', 'WEB')
        })
    }

    public stop() {
        this.server.close((err) => {
            if(err) return console.error(err)
            console.warn('Servidor web detenido', 'WEB')
        })
    }
}