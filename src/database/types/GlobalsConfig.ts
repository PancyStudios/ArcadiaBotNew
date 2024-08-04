import { TextChannel } from "discord.js"
import { 
    Schema,
    SchemaTypes
} from 'mongoose'

export type GlobalConfig = {
    BansAndkickGlobalRegister: string,
    WarnsGlobalRegister: string,
    botId: string
}

export const GlobalConfigSchema = new Schema<GlobalConfig>({
    BansAndkickGlobalRegister: {
        type: SchemaTypes.String,
        required: false,
        default: ''
    },
    WarnsGlobalRegister: {
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