import { config } from 'dotenv'
config()
import('./utils/log/index.js')
import { ExtendedClient } from './structures/Client.js'
import { ErrorHandler } from './handlers/Errors/index.js'
import { ArcadiaDb } from './database/index.js'
import { ServerWeb } from './handlers/Server/index.js'
import ConsoleHandler from './handlers/Console/index.js'

const port = (process.env.serverPort || 3000) as number
export const consoles = new ConsoleHandler()
export const clientExtend = new ExtendedClient()
export const errorManager = new ErrorHandler()
export const db = new ArcadiaDb()
export const server = new ServerWeb(port)

db.init()
clientExtend.start()

