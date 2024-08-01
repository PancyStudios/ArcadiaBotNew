import { Guild } from "discord.js"
import { db as ArcadiaDb } from "../.."
import { AutostatsTypes } from "../../database/types/Guild"

export async function InstallGuild(guild: Guild) {
    const { guilds } = ArcadiaDb
    const guildDb = await guilds.findOne({ guildId: guild.id })
    if(guildDb) return console.log(`El servidor ${guild.name} (${guild.id}) ya esta en la base de datos`, 'GUILD')
    const newGuild = new guilds({
        guildId: guild.id,
        modules: {
            suggestions: false,
            tickets: false,
            welcome: false,
            leave: false,
            messageLogs: false,
            logs: false,
            autostats: false
        },
        settings: {
            tickets: {
                supportRole: "",
                categoryOpen: "",
                categoryClosed: "",
                channelLogs: "",
                webhookLogs: "",
                channelTranscripts: "",
                webhookTranscripts: ""
            },
            suggestions: {
                adminChannel: "",
                suggestionsChannel: "",
                roleGestion: ""
            },
            welcome: {
                channel: "",
                message: "",
                embed: false
            },
            leave: {
                channel: "",
                message: "",
                embed: false
            },
            messageLogs: {
                delete: {
                    channel: "",
                    webhook: ""
                },
                edit: {
                    channel: "",
                    webhook: ""
                }
            },
            logs: {
                channel: "",
                webhook: ""
            },
            autostats: {
                category: "",
                MembersTotal: "",
                MembersUsers: "",
                MembersBots: "",
                types: [AutostatsTypes.MembersTotal, AutostatsTypes.MembersUsers]
            }
        }
    })
    newGuild.save()
    console.log(`El servidor ${guild.name} (${guild.id}) ha sido añadido a la base de datos`, 'GUILD')
}