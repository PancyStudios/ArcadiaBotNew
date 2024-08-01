import { 
    connect, 
    Mongoose, 
    Schema, 
    model, 
    SchemaTypes, 
    Model, 
    Document, 
    Types ,
    connection,
    ConnectionStates
} from 'mongoose'
import { WarnsDb } from './types/Warns'
import { GuildDb } from './types/Guild'
import { EmbedDb } from './types/Embed'

const warnsSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    userId: { type: SchemaTypes.String, required: true },
    warns: { type: SchemaTypes.Array, required: true }
})

const embedSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    name: { type: SchemaTypes.String, required: true },
    embed: {
        title: { type: SchemaTypes.String, required: true },
        description: { type: SchemaTypes.String, required: true },
        color: { type: SchemaTypes.Number, required: true },
        footer: {
            text: { type: SchemaTypes.String, required: true },
            icon_url: { type: SchemaTypes.String, required: true }
        },
        author: {
            name: { type: SchemaTypes.String, required: true },
            icon_url: { type: SchemaTypes.String, required: true }
        },
        image: {
            url: { type: SchemaTypes.String, required: true }
        },
        thumbnail: {
            url: { type: SchemaTypes.String, required: true }
        },
    }
})

const guildSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    modules: {
        suggestions: { type: SchemaTypes.Boolean, required: true },
        tickets: { type: SchemaTypes.Boolean, required: true },
        welcome: { type: SchemaTypes.Boolean, required: true },
        leave: { type: SchemaTypes.Boolean, required: true },
        messageLogs: { type: SchemaTypes.Boolean, required: true },
        logs: { type: SchemaTypes.Boolean, required: true },
        autostats: { type: SchemaTypes.Boolean, required: true }
    },
    loggers: {
        type: SchemaTypes.Array,
        required: true,
        default: []
    },
    settings: {
        tickets: {
            supportRole: { type: SchemaTypes.String, required: true },
            categoryOpen: { type: SchemaTypes.String, required: true },
            categoryClosed: { type: SchemaTypes.String, required: true },
            channelLogs: { type: SchemaTypes.String, required: true },
            channelTranscripts: { type: SchemaTypes.String, required: true }
        } 
        
    }
})

export class ArcadiaDb {
    db: Mongoose | void
    warns: Model<WarnsDb, {}, {}, {}, Document<unknown, {}, WarnsDb> & WarnsDb & {
        _id: Types.ObjectId;
    }, any>
    embeds: Model<EmbedDb, {}, {}, {}, Document<unknown, {}, EmbedDb> & EmbedDb & {
        _id: Types.ObjectId;
    }, any>
    guilds: Model<GuildDb, {}, {}, {}, Document<unknown, {}, GuildDb> & GuildDb & {
        _id: Types.ObjectId;
    }, any>


    constructor() {
        (async () => {
            this.db = await connect('mongodb://dono-03.danbot.host:1785/', {
                user: 'admin',
                pass: process.env.mongooseDbPassword,
                compressors: 'none',
                appName: 'Arcadia',
                dbName: 'Arcadia',
            }).catch((err) => {
                console.warn('No se pudo conectar a la base de datos', err)
                console.error(err)
            })

            if(this.db) { console.log('Conectado a la base de datos') }

            this.warns = model<WarnsDb>('warns', warnsSchema)
            this.guilds = model<GuildDb>('guilds', guildSchema)
            this.embeds = model<EmbedDb>('embeds', embedSchema)
        })
    }

    getStatusDb() {
        return connection.readyState
    }

    getStatusDbString() {
        const status = this.getStatusDb()
        if(status === ConnectionStates.connected) return ' | Conectada'
        if(status === ConnectionStates.connecting) return ' | Conectando'
        if(status === ConnectionStates.disconnected) return ' | Desconectado'
        if(status === ConnectionStates.disconnecting) return ' | Desconectando'
        if(status === ConnectionStates.uninitialized) return ' | No inicializada'
        return ' | Estado desconocido'
    }       

    async disconnect() {
        await connection.close().catch((err) => {
            console.warn('No se pudo desconectar de la base de datos', err)
            console.error(err)
        })
        console.warn('Desconectado de la base de datos')
    }
}