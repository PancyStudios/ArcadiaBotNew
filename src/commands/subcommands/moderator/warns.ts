import { Command } from "../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { db } from '../../..'

export default new Command({
    name: 'warns',
    description: 'Lista de warns de un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'usuario',
            description: 'Usuario a buscar',
            type: ApplicationCommandOptionType.User,
            required: false,
        }
    ],

    run: async({ interaction, args, client }) => {
        const { warns } = db
        const user = args.getUser('usuario')
        const embedClearAdv = new EmbedBuilder()
        .setTitle(`🔖 - Lista de advertencias de ${user ? user.username : interaction.user.username}`)
        .setColor('Green')
        .setDescription(`No se han encontrado advertencias del usuario en este servidor
            
            > 💫 - **Cantidad de advertencias:** 0
            > 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>`)
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.id})

        
        const embedFind = new EmbedBuilder()
        .setTitle(`🔖 - Lista de advertencias de ${user ? user.username : interaction.user.username}`)
        .setColor('Blue')
        .setDescription(`Espere un momento en lo que obtenemos las advertencias del usuario...
            
            > 💫 - **Cantidad de advertencias:** Desconocido
            > 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>`)
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.id})

        interaction.reply({ embeds: [embedFind], ephemeral: true })
        if(user) {
            if(interaction.member.permissions.has('ManageMessages') || interaction.member.roles.cache.hasAny(...client.getBotAccessRoleIdCache())) return interaction.editReply({ content: 'No tienes permisos para ver la lista de advertencias de otro usuario', embeds: [] })
            const warnList = await warns.findOne({ guildId: interaction.guildId, userId: user.id })
            if(!warnList) return interaction.editReply({ embeds: [embedClearAdv] })
            if(warnList.warns.length === 0) return interaction.editReply({ embeds: [embedClearAdv] })
            const embed = new EmbedBuilder()
            .setTitle(`🔖 - Lista de advertencias de ${user.username} (${user.id})`)
            .setColor('Orange')  
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.id})

            let description: string = ``
            warnList.warns.forEach(warn => {
                description += `> **Advertencia:** ${warn.reason} \n> **Moderador:** ${warn.moderator} \n> **ID:** ${warn.id} \n\n`
            })
            description += `> 💫 - **Cantidad de advertencias:** ${warnList.warns.length} \n> 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>`
            embed.setDescription(description)
            interaction.editReply({ embeds: [embed] })
        } else {
            const permissionModeratorView = interaction.member.permissions.has('ManageMessages') || interaction.member.roles.cache.hasAny(...client.getBotAccessRoleIdCache())
        
            const warnList = await warns.findOne({ guildId: interaction.guildId, userId: interaction.user.id })
            if(!warnList) return interaction.editReply({ embeds: [embedClearAdv] })
            if(warnList.warns.length === 0) return interaction.editReply({ embeds: [embedClearAdv] })
            const embed = new EmbedBuilder()
            .setTitle(`🔖 - Lista de advertencias de ${interaction.user.username} (${interaction.user.id})`)
            .setColor('Orange')  
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.id})

            let description: string = ``
            warnList.warns.forEach(async warn => {
                const moderator = await interaction.guild.members.fetch(warn.moderator)
                description += `> **Advertencia:** ${warn.reason} \n> **Moderador:** ${permissionModeratorView ? (moderator ? moderator.user.tag : 'Desconocido') : 'Oculto'} \n> **ID:** ${warn.id} \n\n`
            })
            description += `> 💫 - **Cantidad de advertencias:** ${warnList.warns.length} \n> 🕒 - **Fecha de consulta:** <t:${Math.floor(Date.now() / 1000)}>`
            embed.setDescription(description)
            interaction.editReply({ embeds: [embed] })
        }
    }
})