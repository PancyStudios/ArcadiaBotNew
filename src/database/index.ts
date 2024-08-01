import { 
    connect, 
    Mongoose, 
    model, 
    Model, 
    Document, 
    Types ,
    connection,
    ConnectionStates
} from 'mongoose'
import { WarnsDb, warnsSchema } from './types/Warns'
import { GuildDb, guildSchema } from './types/Guild'
import { EmbedDb, embedSchema } from './types/Embed'


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

    }

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

        if(this.db) { 
            console.log('Conectado a la base de datos', 'MongoDb') 
        }

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