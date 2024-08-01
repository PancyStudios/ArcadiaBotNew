import { config } from 'dotenv'
config()
import('./utils/log')
import { ExtendedClient } from './structures/Client'
import { ErrorHandler } from './handlers/Errors'
import { ArcadiaDb } from './database'

export const clientExtend = new ExtendedClient()
export const errorManager = new ErrorHandler()
export const db = new ArcadiaDb()


clientExtend.start()