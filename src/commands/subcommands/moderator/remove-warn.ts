import { Command } from "../../../structures/SubCommandSlash";
import { db } from '../../..'
import { ApplicationCommandOptionType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ComponentType } from "discord.js";

export default new Command({
    name: 'warn-remove',
    description: 'Elimina un warn de un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a eliminar el warn',
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    userPermissions: ['KickMembers'],

    run: async({ interaction, args }) => {
        const { guildId } = interaction
        const { warns } = db
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
        let options: StringSelectMenuOptionBuilder[] = []
        const menu = new StringSelectMenuBuilder()
        .setCustomId('warn-remove')
        .setPlaceholder('Selecciona las advertencias a eliminar')
        .setMaxValues(25)
        warnDb.warns.forEach(async warn => {
            const moderator = await interaction.guild.members.fetch(warn.moderator)
            description += `> **Advertencia:** ${warn.reason} \n> **Moderador:** ${moderator ? moderator.user.tag : 'Desconocido'} \n> **ID:** ${warn.id} \n\n`

            menu.addOptions(
                new StringSelectMenuOptionBuilder()
                .setLabel(`Advertencia: ${warn.id}`)
                .setDescription(`Razón: ${warn.reason}`)
                .setValue(warn.id)
                .setEmoji('🛡️')
            )
        })
        description += `> 💫 - **Cantidad de advertencias:** ${warnDb.warns.length} \n> 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>\n\`\`\`\n 🛡️ Selecciona las advertencias a eliminar\`\`\``
        embed.setDescription(description)


        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(menu.addOptions(options))

        if(options.length = 0) return interaction.editReply({ content: 'Error en crear el array' })
        const reply = await interaction.editReply({ embeds: [embed], components: [actionRow] }).catch((err) => { console.error(err) })
        if(!reply) return
        const response = await reply.awaitMessageComponent({ componentType: ComponentType.StringSelect, time:  240_000 }).catch((err) => {console.error(err)})
        if(!response) return interaction.editReply({ content: 'Tiempo de espera agotado', components: [] })
        const choices = response.values

        const newWarns = warnDb.warns.filter(warn => !choices.includes(warn.id))
        await warns.updateOne({ guildId: guildId, userId: user.id }, { $set: { warns: newWarns } })

        interaction.editReply({ content: 'Advertencias eliminadas', components: [] })
    }
})