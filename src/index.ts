import { config } from 'dotenv'
config()
import('./utils/log')
import { ExtendedClient } from './structures/Client'
import { ErrorHandler } from './handlers/Errors'
import { ArcadiaDb } from './database'
import { ServerWeb } from './handlers/Server'
import ConsoleHandler from './handlers/Console'

const port = (process.env.serverPort || 3000) as number
export const consoles = new ConsoleHandler()
export const clientExtend = new ExtendedClient()
export const errorManager = new ErrorHandler()
export const db = new ArcadiaDb()
export const server = new ServerWeb(port)

db.init()
clientExtend.start()

