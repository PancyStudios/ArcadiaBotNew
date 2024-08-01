import { Command } from "../../../structures/SubCommandSlash";
import { db } from '../../..'
import { ApplicationCommandOptionType } from "discord.js";

export default new Command({
    name: 'delete',
    description: 'Elimina un embed',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'embed',
            description: 'Nombre del embed',
            type: 3,
            required: true,
            autocomplete: true
        }
    ],

    auto: async({ interaction, args }) => {
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
    run: async({ interaction, args }) => {
        const { embeds } = db
        const { guildId } = interaction
        const embedName = args.getString('embed')
        const embedDb = await embeds.deleteOne({ guildId: guildId, name: embedName })

        embedDb.deletedCount === 1 ? interaction.reply({ content: 'Embed eliminado', ephemeral: true}) : interaction.reply({ content: 'Embed no encontrado', ephemeral: true })
    }
})