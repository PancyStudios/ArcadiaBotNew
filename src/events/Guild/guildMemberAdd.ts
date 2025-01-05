import { Event } from "../../structures/Event";
import { Embed, EmbedBuilder, GuildMember } from "discord.js";
import { textChange } from "../../utils/func";
import { db, errorManager } from "../.."; 

export default new Event('guildMemberAdd', async (member) => {
    const { guild } = member
    const { guilds, embeds } = db
    const guildDb = await guilds.findOne({ guildId: guild.id })
    if(!guildDb) return;
    if(guildDb.modules.welcome === false) return;
    const { settings } = guildDb
    const { welcome } = settings

    const channel = await guild.channels.fetch(welcome.channel).catch(() => null)
    if(!channel) return errorManager.reportError(`No se ha encontrado el canal de bienvenidas en ${guild.id} (${guild.name})`, 'GuildMemberAdd')
    const message = textChange(welcome.message, member, guild)
    const embed = await embeds.findOne({ guildId: guild.id, name: welcome.embed })
    let EmbedFinal: EmbedBuilder
    if(embed) {
        EmbedFinal = new EmbedBuilder({
            title: embed.embed.title ? textChange(embed.embed.title, member, guild) : null,
            description: embed.embed.description ? textChange(embed.embed.description, member, guild) : null,
            color: embed.embed.color ? embed.embed.color : null,
            timestamp: embed.embed.timestamp ? new Date() : null,
            
        })
    }
})
