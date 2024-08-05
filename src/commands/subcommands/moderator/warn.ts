import { ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../..";

export default new Command({
    name: 'warn',
    description: 'Advierte a un usuario',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a advertir',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'reason',
            description: 'Razón de la advertencia',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    userPermissions: ['ManageMessages'],

    run: async ({ interaction, args, client }) => {
        const { guildId } = interaction
        const { warns, global } = db
        const user = args.getUser('user')
        const reason = args.getString('reason')
        const warnDb = await warns.findOne({ guildId: guildId, userId: user.id })
        const uuid = crypto.randomUUID()
        const shortUuid = uuid.split('-').slice(0, 3).join('-');

        if(!warnDb) {
            const newUserWarns = new warns({
                userId: user.id,
                guildId: guildId,
                warns: [{ reason: reason, moderator: interaction.user.id, id: shortUuid }]
            })
            await newUserWarns.save()
        }

        warnDb.warns.push({ reason: reason, moderator: interaction.user.id, id: shortUuid })
        await warns.updateOne({ guildId: guildId, userId: user.id }, { $set: { warns: warnDb.warns } })

        const msg = await interaction.fetchReply()

        const globalDb = await global.findOne({ botId: client.user.id })
        if(globalDb) {
            const warnDb2 = await warns.findOne({ guildId: guildId, userId: user.id })
            const channelId = globalDb.WarnsGlobalRegister
            const channel = await client.channels.fetch(channelId) as TextChannel;
            
            const embedLog = new EmbedBuilder()
            .setAuthor({ name: `🌙 - Advertencia Añadida`, url: msg?.url ?? null })
            .setColor(warnDb2.warns.length >= 7 ? 'Red' :'Yellow')
            .setDescription(`⚠️ - **Usuario Advertido:** ${user.tag} (${user.id})
                🔖 - **Recuento de advertencias:** ${warnDb2.warns.length} / 7 ${warnDb2.warns.length >= 7 ? 'El usuario a superado/llegado al limite de advertencias' : ''}
                🔨 - **Razon:** ${reason}
                
                🛡️ - **Moderador:** ${interaction.user.tag} (${interaction.user.id})
                ⚒️ - **Accion realizada en:** ${interaction.channel.url}

                🕒 - **Fecha:** <t:${Math.floor(Date.now() / 1000)}>`)
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })

            channel?.send({ embeds: [embedLog] })
        }

        const embedUser = new EmbedBuilder()
        .setTitle('⚠️ - Advertencia recibida')
        .setColor('Yellow')
        .setDescription(`⚒️ - **Servidor:** ${interaction.guild.name} (${interaction.guild.id})
            🔨 - **Razon:** ${reason}

            🕒 - **Fecha:** <t:${Math.floor(Date.now() / 1000)}>`)
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })

        await user.send({ embeds: [embedUser] }).catch(() => {
            interaction.channel.send({ content: 'El usuario tiene el MD cerrado' })
        })

        await interaction.reply({ content: `Advertencia enviada a ${user.tag}`})
    }
})