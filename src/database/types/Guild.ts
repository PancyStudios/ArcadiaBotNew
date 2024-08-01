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
            supportRole: { type: SchemaTypes.String, required: true },
            categoryOpen: { type: SchemaTypes.String, required: true },
            categoryClosed: { type: SchemaTypes.String, required: true },
            channelLogs: { type: SchemaTypes.String, required: true },
            webhookLogs: { type: SchemaTypes.String, required: true },
            channelTranscripts: { type: SchemaTypes.String, required: true },
            webhookTranscripts: { type: SchemaTypes.String, required: true },
            choices: { type: SchemaTypes.Array, required: true },
            embed: { type: SchemaTypes.String, required: true }
        },
        suggestions: {
            adminChannel: { type: SchemaTypes.String, required: true },
            suggestionsChannel: { type: SchemaTypes.String, required: true },
            roleGestion: { type: SchemaTypes.String, required: true },
            topics: { type: SchemaTypes.Array, required: true }
        },
        welcome: {
            channel: { type: SchemaTypes.String, required: true },
            message: { type: SchemaTypes.String, required: true },
            embed: { type: SchemaTypes.Boolean, required: true }
        },
        leave: {
            channel: { type: SchemaTypes.String, required: true },
            message: { type: SchemaTypes.String, required: true },
            embed: { type: SchemaTypes.Boolean, required: true }
        },
        messageLogs: {
            delete: {
                channel: { type: SchemaTypes.String, required: true },
                webhook: { type: SchemaTypes.String, required: true }
            },
            edit: {
                channel: { type: SchemaTypes.String, required: true },
                webhook: { type: SchemaTypes.String, required: true }
            }
        },
        logs: {
            channel: { type: SchemaTypes.String, required: true },
            webhook: { type: SchemaTypes.String, required: true }
        },
        autostats: {
            category: { type: SchemaTypes.String, required: true },
            MembersTotal: { type: SchemaTypes.String, required: true },
            MembersUsers: { type: SchemaTypes.String, required: true },
            MembersBots: { type: SchemaTypes.String, required: true },
            types: { type: SchemaTypes.Array, required: true }
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