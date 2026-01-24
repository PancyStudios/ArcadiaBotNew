import { EmbedBuilder, ApplicationCommandOptionType, ChannelType, TextChannel } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../..";
import { isUrl, textChange } from "../../../utils/func";
import { text } from "express";

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
        const { guildId, guild, member } = interaction
        const { embeds } = db
        const embedDb = await embeds.findOne({ guildId: guildId, name: embedName })
        if(!embedDb) return interaction.reply({ content: "Embed no encontrado", ephemeral: true })
        const embed = embedDb.embed
        
        if(channel) {
            if(channel.permissionsFor(await guild.members.fetchMe())?.has(['SendMessages', 'EmbedLinks'])) {
                return interaction.reply({ content: "No tengo permisos para enviar mensajes o embeds en ese canal", ephemeral: true })
            }
        }
        const EmbedSend = new EmbedBuilder({
            title: embed.title ? textChange(embed.title, member, guild) : undefined,
            description: embed.description ? textChange(embed.description, member, guild) : undefined,
            color: embed.color,
            image: embed.image ? {
                url: isUrl(embed.image.url, member, guild) ? textChange(embed.image.url, member, guild) : undefined
            } : undefined,
            thumbnail: embed.thumbnail ? {
                url: isUrl(embed.thumbnail.url, member, guild) ? textChange(embed.thumbnail.url, member, guild) : undefined
            } : undefined,
            footer: embed.footer ? {
                text: embed.footer.text ? textChange(embed.footer.text, member, guild) : undefined,
                icon_url: isUrl(embed.footer.icon_url, member, guild) ? textChange(embed.footer.icon_url, member, guild) : undefined
            } : undefined,
            author: embed.author ? {
                name: textChange(embed.author.name, member, guild),
                icon_url: isUrl(embed.author.icon_url, member, guild) ? textChange(embed.author.icon_url, member, guild) : undefined,
                url: null
            } : undefined,
        })

        console.log(EmbedSend.data, 'debug')

        channel ? await channel.send({ embeds: [embed] }) : await interaction.channel.send({ embeds: [embed] })
        interaction.reply({ content: "Embed enviado con exito", ephemeral: true })
    }
})