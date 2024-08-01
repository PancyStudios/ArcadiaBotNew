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
import { GuildDb, guildSchema } from './types/Guild'
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
        title: { type: SchemaTypes.String, required: false },
        description: { type: SchemaTypes.String, required: true },
        color: { type: SchemaTypes.Number, required: false },
        footer: {
            text: { type: SchemaTypes.String, required: false },
            icon_url: { type: SchemaTypes.String, required: false }
        },
        author: {
            name: { type: SchemaTypes.String, required: false },
            icon_url: { type: SchemaTypes.String, required: false }
        },
        image: {
            url: { type: SchemaTypes.String, required: false }
        },
        thumbnail: {
            url: { type: SchemaTypes.String, required: false }
        },
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


    constructor() {}

    async init() {
        console.log('Conectando a la base de datos', 'MongoDb')
        this.db = await connect('mongodb://dono-03.danbot.host:1785/', {
            user: 'admin',
            pass: process.env.mongooseDbPassword,
            compressors: 'none',
            appName: 'Arcadia',
            dbName: 'Arcadia',
        }).catch((err) => {
            console.warn('No se pudo conectar a la base de datos', 'MongoDb')
            console.error(err, 'MongoDb')
        })

        if(this.db) { console.log('Conectado a la base de datos', 'MongoDb') }

        this.warns = model<WarnsDb>('warns', warnsSchema)
        this.guilds = model<GuildDb>('guilds', guildSchema)
        this.embeds = model<EmbedDb>('embeds', embedSchema)

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