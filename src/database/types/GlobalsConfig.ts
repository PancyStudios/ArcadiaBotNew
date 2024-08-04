import { TextChannel } from "discord.js"
import { 
    Schema,
    SchemaTypes
} from 'mongoose'

export type GlobalConfig = {
    bansGlobalRegister: string,
    kicksGlobalRegister: string,
    botId: string
}

export const GlobalConfigSchema = new Schema<GlobalConfig>({
    bansGlobalRegister: {
        type: SchemaTypes.String,
        required: false,
        default: ''
    },
    kicksGlobalRegister: {
        type: SchemaTypes.String,
        required: false,
        default: ''
    },
    botId: {
        type: SchemaTypes.String,
        required: false,
        default: ''
    }
})