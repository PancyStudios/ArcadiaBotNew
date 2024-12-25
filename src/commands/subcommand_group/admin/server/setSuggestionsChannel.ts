import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { db } from "../../../..";

export default new Command({
    name: 'suggestions_channel',
    description: 'Establece el canal de sugerencias',
    options: [
        {
            name: 'channel',
            description: 'Canal de sugerencias',
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channelTypes: [ChannelType.GuildText]
        }
    ],
    type: ApplicationCommandOptionType.Subcommand,

    run: async ({ interaction, client, args }) => {
        
    }
})