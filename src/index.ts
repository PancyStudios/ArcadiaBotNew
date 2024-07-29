import { config } from 'dotenv'
config()
import('./utils/log')
import { ExtendedClient } from './structures/Client'
import { ErrorHandler } from './handlers/Errors'

export const clientExtend = new ExtendedClient()
export const errorManager = new ErrorHandler()

clientExtend.start()