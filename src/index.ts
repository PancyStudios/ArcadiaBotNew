import { config } from 'dotenv'
config()
import('./utils/log')
import { ExtendedClient } from './structures/Client'
import { ErrorHandler } from './handlers/Errors'
import { ArcadiaDb } from './database'
import { ServerWeb } from './handlers/Server'

export const clientExtend = new ExtendedClient()
export const errorManager = new ErrorHandler()
export const db = new ArcadiaDb()
export const server = new ServerWeb(process.env.PORT || 3000)

db.init()
clientExtend.start()

