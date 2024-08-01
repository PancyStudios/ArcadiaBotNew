import { TextChannel } from "discord.js"

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
    channelTranscripts: string,
}

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
    lggers: Logger[]
    settings: {
        tickets: TicketsSettings
    }
}