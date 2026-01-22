import { Command } from "../../../structures/SubCommandSlash.js";
import { db } from '../../../index.js'
import { ApplicationCommandOptionType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, TextChannel, ComponentType } from "discord.js";

export default new Command({
    name: 'warn-remove',
    description: 'Elimina un advertencias de un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a eliminar las advertencias',
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    userPermissions: ['KickMembers'],

    run: async({ interaction, args, client }) => {
        const { guildId } = interaction
        const { warns, global } = db
        const user = args.getUser('user')
        const warnDb = await warns.findOne({ guildId: guildId, userId: user.id })

        await interaction.reply('Obteniendo advertencias...')

        if(!warnDb || warnDb.warns.length === 0) {
            return interaction.editReply({ content: 'El usuario no tiene advertencias' })
        }
        
        const embed = new EmbedBuilder()
        .setTitle(`🔖 - Lista de advertencias de ${interaction.user.username} (${interaction.user.id})`)
        .setColor('Orange')  
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })

        let description: string = ``
        const menu = new StringSelectMenuBuilder()
        .setCustomId('warn-remove')
        .setPlaceholder('Selecciona las advertencias a eliminar')
        .setMaxValues(warnDb.warns.length)
        .setMinValues(1)

        await warnDb.warns.forEach(async warn => {
            console.debug(warn)
            const moderator = await interaction.guild.members.fetch(warn.moderator)
            description += `> **Advertencia:** ${warn.reason} \n> **Moderador:** ${moderator ? moderator.user.tag : 'Desconocido'} \n> **ID:** ${warn.id} \n\n`

            const label = `Id: ${warn.id}`.padEnd(80, ' ')
            const reason = warn.reason.padEnd(100, ' ')

            const option = new StringSelectMenuOptionBuilder()
            .setLabel(label)
            .setDescription(reason)
            .setValue(warn.id)
            .setEmoji('🛡️')

            menu.addOptions(
                option
            )
        })

        description += `> 💫 - **Cantidad de advertencias:** ${warnDb.warns.length} \n> 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>\n\`\`\`\n 🛡️ Selecciona las advertencias a eliminar\`\`\``
        embed.setDescription(description)

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents([menu])

        console.log(actionRow.toJSON())

        const reply = await interaction.editReply({ embeds: [embed], components: [actionRow] }).catch((err) => { console.error(err) })
        if(!reply) return
        const response = await reply.awaitMessageComponent({ componentType: ComponentType.StringSelect, time:  240_000 }).catch((err) => {console.error(err)})
        if(!response) return interaction.editReply({ content: 'Tiempo de espera agotado', components: [] })
        const choices = response.values

        const embedFinal = new EmbedBuilder()
        .setTitle(`🔖 - Advertencias eliminadas de ${user.username} (${user.id})`)
        .setDescription(`Advertencias eliminadas: ${choices.map(c => `\n> **ID:** ${c}`).join('')}`)
        .setColor('Green')
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })

        const newWarns = warnDb.warns.filter(warn => !choices.includes(warn.id))
        await warns.updateOne({ guildId: guildId, userId: user.id }, { $set: { warns: newWarns } })

        interaction.editReply({ content: null, embeds: [embedFinal], components: [] })

        const msg = await interaction.fetchReply()
        const globalDb = await global.findOne({ botId: client.user.id })
        if(globalDb) {
            const warnDb2 = await warns.findOne({ guildId: guildId, userId: user.id })
            const channelId = globalDb.WarnsGlobalRegister
            const channel = await client.channels.fetch(channelId) as TextChannel;
 
            await choices.forEach(async id => {
                const embedLog = new EmbedBuilder()
                .setAuthor({ name: `🌙 - Advertencia Eliminada`, url: msg?.url ?? null })
                .setColor(warnDb2.warns.length >= 7 ? 'Red' :'Yellow')
                .setDescription(`⚠️ - **Usuario:** ${user.tag} (${user.id})
                🔖 - **Recuento de advertencias:** ${warnDb2.warns.length} / 7 ${warnDb2.warns.length >= 7 ? 'El usuario a superado/llegado al limite de advertencias' : ''}
                🗑️ - **ID de la advertencia eliminada**: ${id}
                
                🛡️ - **Moderador:** ${interaction.user.tag} (${interaction.user.id})
                ⚒️ - **Accion realizada en:** ${interaction.channel.url}

                🕒 - **Fecha:** <t:${Math.floor(Date.now() / 1000)}>`)
                .setThumbnail(interaction.guild.iconURL())
                .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
    
                setTimeout(async() => await channel?.send({ embeds: [embedLog] }),1000)
            })
        }
    }
})