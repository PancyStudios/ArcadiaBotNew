import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../..";
import { ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js";

export default new Command({
    name: 'hackban',
    description: 'Banear a un usuario por ID',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a banear',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'reason',
            description: 'Razón del baneo',
            type: ApplicationCommandOptionType.String,
            required: false,
            max_length: 60
        }
    ],
    userPermissions: ['BanMembers'],
    botPermissions: ['BanMembers'],

    run: async ({ interaction, args, client }) => {
        const user = args.getString('user')
        const reason = args.getString('reason')
        const member = await interaction.guild.members.fetch(user).catch(() => null)
        if(member) return interaction.reply({ content: 'Este usuario esta en el servidor, usa /ban (USER)', ephemeral: true })
        await interaction.reply({ content: 'Baneando al usuario...' })

        if(interaction.guild.bans.cache.get(user)) return interaction.editReply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('Este usuario ya ha sido baneado.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ] })

        const ban = await interaction.guild.members.ban(user, { reason: `${interaction.user.username} - ${reason}` }).catch(() => null)
        if(!ban) return interaction.editReply({ content: 'No se ha podido banear al usuario' })
        const msg = await interaction.fetchReply()
        if(!msg) return

        const date = new Date()
        const dateTimestamp = date.getTime() / 1000

        const msgUrl = msg.url
        const embed = new EmbedBuilder()
        .setAuthor({ name: '🔨 - Baneo (ID) exitoso', iconURL: interaction.user.avatarURL(), url: msgUrl ?? null })
        .setColor('Orange')
        .setDescription(`🍂 Usuario baneado: ${user}
            🍁 Razón: ${reason}
            
            ⚒️ - Acción realizada por: ${interaction.user.username} (${interaction.user.id})
            🛡️ - Realizado en el canal: ${interaction.channel.url}

            🕒 - Fecha: <t:${Math.floor(dateTimestamp)}>`)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.client.user.avatarURL() })
        
        interaction.reply({ embeds: [embed] }).catch((_err) => {})

        const { global } = db
        const guild = await global.findOne({ botId: client.user.id})
        if(!guild) return;
        if(!guild.BansAndkickGlobalRegister) return;
        const globalChannel = await client.channels.fetch(guild.BansAndkickGlobalRegister) as TextChannel
        if(!globalChannel) return;
        globalChannel.send({ embeds: [embed] }).catch((err) => {
            console.log(err)
            return
        })
    }
})