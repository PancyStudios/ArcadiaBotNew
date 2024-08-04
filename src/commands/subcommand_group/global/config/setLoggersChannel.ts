import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, ChannelType, TextChannel, EmbedBuilder } from "discord.js";
import { db } from "../../../..";

export default new Command({
    name: 'logger_setchannel',
    description: 'Establece el canal de logs globales de bans/kicks',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'type',
            description: 'Tipo de logs',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Bans / Kicks',
                    value: 'bans'
                },
                {
                    name: 'Warns',
                    value: 'warn'
                }
            ]
        },
        {
            name: 'channel',
            description: 'Canal de logs',
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channel_types: [ChannelType.GuildText]
        }
    ],

    run: async ({ interaction, args, client }) => {
        const { global, guilds } = db;
        const guildsDb = await guilds.find()
        const rolesId = guildsDb.map(g => { return g.settings.botAccess })
        const rolePermission = interaction.member.roles.cache.find(r => rolesId.includes(r.id))
        if(!rolePermission) return interaction.reply({ content: 'No tienes permisos para ejecutar este comando', ephemeral: true })
        const type = args.getString('type')
        const channel = args.getChannel('channel') as TextChannel;
        const globalDb = global.findOne({ botId: interaction.client.user.id })

        const setEmbed = new EmbedBuilder()
        .setTitle(`🛡️ - Global Logger`)
        .setDescription(`Canal de logs de ${type} establecido en ${channel.url}`)
        .setColor('Green')
        .setTimestamp()

        if(!globalDb) {
            if(type === 'bans') {
                const newGlobal = new global({
                    botId: client.user.id,
                    BansAndkickGlobalRegister: channel.id,
                    WarnsGlobalRegister: ''
                })
                const is = await newGlobal.save().catch((err) => {
                    interaction.reply({ content: 'No se ha podido establecer el canal de logs de bans', ephemeral: true })
                    return
                })
                if(!is) return
                interaction.reply({ embeds: [setEmbed], ephemeral: true })
            } else if(type === 'warn') {
                const newGlobal = new global({
                    botId: client.user.id,
                    BansAndkickGlobalRegister: '',
                    WarnsGlobalRegister: channel.id
                })
                const is = await newGlobal.save().catch((err) => {
                    interaction.reply({ content: 'No se ha podido establecer el canal de logs de kicks', ephemeral: true })
                    return
                })
                if(!is) return
                interaction.reply({ embeds: [setEmbed], ephemeral: true })
            }
        } else {

        }
        
    }
})
