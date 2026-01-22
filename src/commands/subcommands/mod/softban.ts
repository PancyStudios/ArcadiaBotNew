import { Command } from "../../../structures/SubCommandSlash"
import { ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js"
import { db } from "../../../.."

export default new Command({
    name: 'softban',
    description: 'Softbanea a un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'usuario',
            description: 'Usuario a softbanear',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'razon',
            description: 'Razon del softban',
            type: ApplicationCommandOptionType.String,
            required: false,
            max_length: 60
        }
    ],
    userPermissions: ['BanMembers'],
    botPermissions: ['BanMembers'],

    run: async ({ interaction, args, client}) => {
        const { guild } = interaction
        const user = args.getUser('user')
        const reason = args.getString('reason') || 'No especificado'
        const member = await interaction.guild.members.fetch(user.id)
        await interaction.reply({ content: 'Softbaneando al usuario...' })
        const msgUrl = (await interaction.fetchReply()).url
        const me = await interaction.guild.members.fetchMe()
        if(!member) return interaction.editReply({ content: 'No se ha podido encontrar al miembro, usa /hackban (id) para banear a este usuario' })
        if(!member.bannable) return interaction.editReply({ content: 'No puedo banear a este usuario',})
        if(interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.editReply({ content: 'El usuario tiene igual o menor rango que tu' })
        if(me.roles.highest.position <= member.roles.highest.position) return interaction.editReply({ content: 'No puedo banear a este usuario debido a que tiene un rango igual o mayor que el mio' })
        
        const memberBan = await member.ban({ deleteMessageSeconds: 86400, reason: `${interaction.user.id} - ${reason}` }).catch(() => null)
        if(!memberBan) return interaction.editReply({ content: 'No se ha podido banear al usuario' })
        const memberUnban = await guild.members.unban(user.id, reason).catch(() => null)
        if(!memberUnban) return interaction.editReply({ content: 'No se ha podido desbanear al usuario' })

        const embed = new EmbedBuilder()
        .setAuthor({ name: '🔨 - Softban exitoso', iconURL: user.avatarURL(), url: msgUrl ?? null })
        .setColor('Orange')
        .setDescription(`🍂 Usuario softbaneado: ${user.tag} (${user.id})
        🍁 Razón: ${reason}
                
        ⚒️ - Acción realizada por: ${interaction.user.username} (${interaction.user.id})
        🛡️ - Realizado en el canal: ${interaction.channel.url}
    
        🕒 - Fecha: <t:${Math.floor(Date.now() / 1000)}>`)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.client.user.avatarURL() })

        interaction.editReply({ embeds: [embed] })

        const { global } = db
        const globalDb = await global.findOne({ botId: client.user.id})
        if(!globalDb) return;
        if(!globalDb.BansAndkickGlobalRegister) return;
        const globalChannel = await client.channels.fetch(globalDb.BansAndkickGlobalRegister) as TextChannel
        if(!globalChannel) return;
        globalChannel.send({ embeds: [embed] }).catch((err) => {
            console.log(err)
            return
        })
    }
})