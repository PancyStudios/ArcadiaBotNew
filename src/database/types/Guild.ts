import { TextChannel } from "discord.js"
import { 
    Schema,
    SchemaTypes
} from 'mongoose'

export type Logger = {
    name: string,
    channel: TextChannel,
    webhook: string
}

export type TicketsSettings = {
    supportRole: string,
    categoryOpen: string,
    categoryClosed: string,
    channelLogs: string,
    webhookLogs?: string,
    channelTranscripts: string,
    webhookTranscripts?: string,
    choices: string[]
    embed: string
}

export type suggestionsSettings = {
    adminChannel: string,
    suggestionsChannel: string,
    roleGestion: string,
    topics: string[]
}

export type WelcomeOrLeaveSettings = {
    channel: string,
    message: string,
    embed: string
}

export type MessageLogsSettings = {
    delete: {
        channel: string,
        webhook?: string
    },
    edit: {
        channel: string,
        webhook?: string
    }
}

export type LogsSettings = {
    channel: string,
    webhook: string
}

export enum AutostatsTypes {
    MembersTotal = "MembersTotal",
    MembersUsers = "MembersUsers",
    MembersBots = "MembersBots"
}

export type AutostatsSettings = {
    category: string,
    MembersTotal: string,
    MembersUsers: string,
    MembersBots: string,
    types: AutostatsTypes[]
}

export const guildSchema = new Schema({
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
    settings: {
        tickets: {
            supportRole: { type: SchemaTypes.String, required: false },
            categoryOpen: { type: SchemaTypes.String, required: false },
            categoryClosed: { type: SchemaTypes.String, required: false },
            channelLogs: { type: SchemaTypes.String, required: false },
            webhookLogs: { type: SchemaTypes.String, required: false },
            channelTranscripts: { type: SchemaTypes.String, required: false },
            webhookTranscripts: { type: SchemaTypes.String, required: false },
            choices: { type: SchemaTypes.Array, required: false },
            embed: { type: SchemaTypes.String, required: false }
        },
        suggestions: {
            adminChannel: { type: SchemaTypes.String, required: false },
            suggestionsChannel: { type: SchemaTypes.String, required: false },
            roleGestion: { type: SchemaTypes.String, required: false },
            topics: { type: SchemaTypes.Array, required: false }
        },
        welcome: {
            channel: { type: SchemaTypes.String, required: false },
            message: { type: SchemaTypes.String, required: false },
            embed: { type: SchemaTypes.String, required: false }
        },
        leave: {
            channel: { type: SchemaTypes.String, required: false },
            message: { type: SchemaTypes.String, required: false },
            embed: { type: SchemaTypes.String, required: false }
        },
        messageLogs: {
            delete: {
                channel: { type: SchemaTypes.String, required: false },
                webhook: { type: SchemaTypes.String, required: false }
            },
            edit: {
                channel: { type: SchemaTypes.String, required: false },
                webhook: { type: SchemaTypes.String, required: false }
            }
        },
        logs: {
            channel: { type: SchemaTypes.String, required: false },
            webhook: { type: SchemaTypes.String, required: false }
        },
        autostats: {
            category: { type: SchemaTypes.String, required: false },
            MembersTotal: { type: SchemaTypes.String, required: false },
            MembersUsers: { type: SchemaTypes.String, required: false },
            MembersBots: { type: SchemaTypes.String, required: false },
            types: { type: SchemaTypes.Array, required: false }
        }
    }
})


export type GuildDb = {
    guildId: string
    modules: {
        suggestions: boolean,
        tickets: boolean,
        welcome: boolean,
        leave: boolean,
        messageLogs: boolean,
        logs: boolean
        autostats: boolean
    }
    settings: {
        tickets: TicketsSettings,
        suggestions: suggestionsSettings,
        welcome: WelcomeOrLeaveSettings,
        leave: WelcomeOrLeaveSettings,
        messageLogs: MessageLogsSettings,
        logs: LogsSettings,
        autostats: AutostatsSettings
    }
}