import { Guild, GuildMember } from "discord.js"
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
                webhookTranscripts: "",
                embed: "",
                choices: ['General']
            },
            suggestions: {
                adminChannel: "",
                suggestionsChannel: "",
                roleGestion: "",
                topics: ['General']
            },
            welcome: {
                channel: "",
                message: "",
                embed: ""
            },
            leave: {
                channel: "",
                message: "",
                embed: ""
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
export function isUrl(url: string, member?: GuildMember, guild?: Guild) {
    const regex = new RegExp(/^(http|https):\/\/[^ "]+$/);
    const finalText = textChange(url, member, guild)
    return regex.test(finalText)
}

export function textChange(text: string, member?: GuildMember, guild?: Guild) {
    if(!text) return null;
    let returnText:string
    if(member) {
        returnText = text.replace(/{member}/g, member.toString())
        returnText = text.replace(/{member.user.tag}/g, member.user.tag)
        returnText = text.replace(/{member.user.name}/g, member.user.username)
        returnText = text.replaceAll(/{member.user.iconUrl}/g, member.user.avatarURL())
        returnText = text.replaceAll(/{member.iconUrl}/g, member.displayAvatarURL())
        returnText = text.replace(/{member.id}/g, member.id)

    }
    if(guild) {
        returnText = text.replaceAll(/{guild}/g, guild.toString())
        returnText = text.replaceAll(/{guild.name}/g, guild.name)
        returnText = text.replaceAll(/{guild.id}/g, guild.id)
        returnText = text.replaceAll(/{guild.owner}/g, guild.members.cache.get(guild.ownerId).toString())
        returnText = text.replaceAll(/{guild.owner.tag}/g, guild.members.cache.get(guild.ownerId).user.tag)
        returnText = text.replaceAll(/{guild.owner.name}/g, guild.members.cache.get(guild.ownerId).user.username)
        returnText = text.replaceAll(/{guild.owner.id}/g, guild.ownerId)
        returnText = text.replaceAll(/{guild.members_size}/g, guild.members.cache.size.toString())
        returnText = text.replaceAll(/{guild.iconUrl}/g, guild.iconURL())
    }

    return returnText;
}