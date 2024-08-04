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
                    name: 'Bans',
                    value: 'bans'
                },
                {
                    name: 'Kicks',
                    value: 'kicks'
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
        // const { global } = db;
        // const type = args.getString('type')
        // const channel = args.getChannel('channel') as TextChannel;
        // const globalDb = global.findOne({ botId: interaction.client.user.id })

        // const setEmbed = new EmbedBuilder()
        // .setTitle(`🛡️ - Global Logger`)
        // .setDescription(`Canal de logs de ${type} establecido en ${channel.url}`)
        // .setColor('Green')
        // .setTimestamp()

        // if(!globalDb) {
        //     if(type === 'bans') {
        //         const newGlobal = new global({
        //             botId: client.user.id,
        //             bansGlobalRegister: channel.id,
        //             kicksGlobalRegister: ''
        //         })
        //         const is = await newGlobal.save().catch((err) => {
        //             interaction.reply({ content: 'No se ha podido establecer el canal de logs de bans', ephemeral: true })
        //             return
        //         })
        //         if(!is) return
        //         interaction.reply({ embeds: [setEmbed], ephemeral: true })
        //     } else if(type === 'kicks') {
        //         const newGlobal = new global({
        //             botId: client.user.id,
        //             bansGlobalRegister: '',
        //             kicksGlobalRegister: channel.id
        //         })
        //         const is = await newGlobal.save().catch((err) => {
        //             interaction.reply({ content: 'No se ha podido establecer el canal de logs de kicks', ephemeral: true })
        //             return
        //         })
        //         if(!is) return
        //         interaction.reply({ embeds: [setEmbed], ephemeral: true })
        //     }
        // } else {

        // }
        
    }
})
