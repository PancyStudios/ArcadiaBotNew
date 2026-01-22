import { Command } from "../../../structures/SubCommandSlash.js";
import { ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "../../../index.js";

export default new Command({
    name: 'unban',
    description: 'Desbanea a un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user_id',
            description: 'ID del usuario a desbanear',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'reason',
            description: 'Razón del desbaneo',
            type: ApplicationCommandOptionType.String,
            required: false
        }
    ],
    userPermissions: ['BanMembers'],
    botPermissions: ['BanMembers'],

    run: async ({ interaction, args, client }) => {
        const { guild } = interaction
        const userId = args.getString('user_id')
        const user = await client.users.fetch(userId).catch()
        if(!user) return interaction.reply({ content: 'No se ha podido encontrar al usuario', ephemeral: true })
        const reason = args.getString('reason') || 'No especificado'
        interaction.reply({ content: 'Desbaneando al usuario...' })
        if(guild.bans.cache.has(user?.id)) return interaction.editReply({ content: 'El usuario no esta baneado'})
        const unban = await guild.members.unban(user.id).catch(() => { })
        const msgUrl = (await interaction.fetchReply()).url
        if(!unban) return interaction.reply({ content: 'No se ha podido desbanear al usuario', ephemeral: true })
        
        const embed = new EmbedBuilder()
        .setAuthor({ name: '🔨 - Desbaneo exitoso', iconURL: user.avatarURL(), url: msgUrl ?? null })
        .setColor('Orange')
            .setDescription(`🍂 Usuario desbaneado: ${user.tag} (${user.id})
            🍁 Razón: ${reason}
                
            ⚒️ - Acción realizada por: ${interaction.user.username} (${interaction.user.id})
            🛡️ - Realizado en el canal: ${interaction.channel.url}
    
            🕒 - Fecha: <t:${Math.floor(Date.now() / 1000)}>`)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.client.user.avatarURL() })

        interaction.reply({ embeds: [embed] })
        
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