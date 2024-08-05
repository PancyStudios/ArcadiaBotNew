import { ApplicationCommandOptionType, GuildMember, EmbedBuilder } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";

export default new Command({
    name: 'unmute',
    description: 'Desmutear a un usuario',
    type: 1,
    options: [
        {
            name: 'usuario',
            description: 'Usuario a desmutear',
            type: ApplicationCommandOptionType.User
        }
    ],
    userPermissions: ['MuteMembers'],
    botPermissions: ['MuteMembers'],

    run: async({ interaction, args }) => {
        const { guild } = interaction
        const member = args.getMember('usuario') as GuildMember
        member.isCommunicationDisabled()
        member.disableCommunicationUntil

        if(interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedes desilenciar a un usuario con un rol igual o superior al tuyo.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        const me = await interaction.guild.members.fetch(interaction.client.user.id)
        if(me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo desilenciar a este usuario debido a que tiene un rol igual o superior al mio.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        if(member.permissions.has(['Administrator']) || member.permissions.has(['MuteMembers'])) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo desilenciar a este usuario debido a que tiene el permiso `MuteMembers`.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        if(!member.moderatable) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo desilenciar a este usuario.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })

        member.timeout(null, `Desmuteado por ${interaction.user.tag}`)
        
        interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('🔊 - Usuario desilenciado')
            .setDescription(`El usuario ${member.user.tag} ha sido desilenciado`)
            .setColor('Green')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true }).catch(() => {})

        member.send({ embeds: [
            new EmbedBuilder()
            .setTitle('🔊 - Desilenciado')
            .setDescription(`Has sido desilenciado manualmente en ${guild.name}`)
            .setColor('Green')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ]}).catch(() => {})
    }
})