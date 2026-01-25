import {EmbedBuilder, Guild, GuildMember, Message } from "discord.js"
import {db as ArcadiaDb} from "../.."
import { AutostatsTypes } from "../../database/types/Guild"
import { version } from '../../../package.json'

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
            },
            status: {
                ip: "",
                port: 0,
                type: null
            },
            botAccess: ""
        }
    })
    newGuild.save()
    console.log(`El servidor ${guild.name} (${guild.id}) ha sido añadido a la base de datos`, 'GUILD')
}
export function isUrl(input: string | null | undefined, member?: GuildMember, guild?: Guild): boolean {
    if (!input) return false;

    const final = textChange(input, member, guild);
    if (!final) return false;

    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
    return regex.test(final);
}

export function textChange(text: string | null | undefined, member?: GuildMember, guild?: Guild): string | null {
    if (!text) return undefined;

    let result = text;  // empezamos con el texto original

    if (member) {
        result = result.replaceAll(/{member}/g,            member.toString());
        result = result.replaceAll(/{member\.user\.tag}/g, member.user.tag ?? member.user.username);
        result = result.replaceAll(/{member\.user\.name}/g, member.user.username);
        result = result.replaceAll(/{member\.user\.iconUrl}/g, member.user.avatarURL() ?? "");
        result = result.replaceAll(/{member\.iconUrl}/g,    member.displayAvatarURL() ?? "");
        result = result.replaceAll(/{member\.id}/g,         member.id);
    }

    if (guild) {
        const owner = guild.members.cache.get(guild.ownerId);

        result = result.replaceAll(/{guild}/g,             guild.toString());
        result = result.replaceAll(/{guild\.name}/g,       guild.name);
        result = result.replaceAll(/{guild\.id}/g,         guild.id);
        result = result.replaceAll(/{guild\.owner}/g,      owner?.toString() ?? "");
        result = result.replaceAll(/{guild\.owner\.tag}/g, owner?.user.tag ?? "");
        result = result.replaceAll(/{guild\.owner\.name}/g, owner?.user.username ?? "");
        result = result.replaceAll(/{guild\.owner\.id}/g,  guild.ownerId);
        result = result.replaceAll(/{guild\.members_size}/g, guild.memberCount.toString()); // mejor que .cache.size
        result = result.replaceAll(/{guild\.iconUrl}/g,    guild.iconURL({ size: 1024 }) ?? "");
    }

    return result;
}

export async function editSuggestionMessage(message: Message) {
    const suggest = await ArcadiaDb.suggestions.findOne({ messageId: message.id })
    if(!suggest) throw new Error(`Suggestion ${message.id} doesn't exist`);
    const { authorId, suggestion, date, upVotes, downVotes } = suggest
    const SuggestionEmbed = new EmbedBuilder()
      .setTitle('📩 | Nueva sugerencia')
      .setDescription(`\`\`\`${suggestion}\`\`\`\n📝 - **Estado:** \`Pendiente\`\n📅 - **Fecha:** \`${date.toLocaleDateString()}\`\n👤 - **Autor:** <@${authorId}>\n\n📊 - **Votos:**\n🔼 - **A favor:** \`${upVotes}\`\n🔽 - **En contra:** \`${downVotes}\``)
      .setColor('Blue')
      .setTimestamp()
      .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

    await message.edit({ embeds: [SuggestionEmbed] }).catch((e) => console.warn(e) )
}