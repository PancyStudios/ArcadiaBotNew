import { EmbedBuilder, ApplicationCommandOptionType, ChannelType, TextChannel } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../..";

export default new Command({
    name: "send",
    description: "Envia un embed",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: "embed",
            description: "El embed que quieres enviar",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: "channel",
            description: "Canal donde quieres enviar el embed",
            type: ApplicationCommandOptionType.Channel,
            required: false,
            channel_types: [ChannelType.GuildAnnouncement, ChannelType.GuildText]
        }
    ],

    auto: async ({ interaction, args }) => {
        const focus = args.getFocused(true)
        if(focus.name !== 'embed') return;
        const { guildId } = interaction
        const { embeds } = db
        const embedDb = await embeds.find({ guildId: guildId })

        const choices = embedDb.map(embed => { 
            return embed.name
        })
        const filter = choices.filter(embed => embed.startsWith(focus.value)).slice(0, 25)
        const filterArray = filter.map(embed => {
            return {
                name: embed,
                value: embed
            }
        })
        interaction.respond(filterArray)
    },
    run: async ({ interaction, args }) => {
        const embedName = args.getString("embed")
        const channel = args.getChannel("channel") as TextChannel
        const { guildId, guild } = interaction
        const { embeds } = db
        const embedDb = await embeds.findOne({ guildId: guildId, name: embedName })
        if(!embedDb) return interaction.reply({ content: "Embed no encontrado", ephemeral: true })
        const embed = new EmbedBuilder(embedDb.embed)
        
        if(channel) {
            if(channel.permissionsFor(await guild.members.fetchMe())?.has(['SendMessages', 'EmbedLinks'])) {
                return interaction.reply({ content: "No tengo permisos para enviar mensajes o embeds en ese canal", ephemeral: true })
            }
        }

        channel ? await channel.send({ embeds: [embed] }) : await interaction.channel.send({ embeds: [embed] })
        interaction.reply({ content: "Embed enviadocon exito", ephemeral: true })
    }
})