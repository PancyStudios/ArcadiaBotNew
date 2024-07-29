import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from '../../../../structures/SubCommandSlash';

export default new Command({
    name: 'test',
    description: 'Test command',
    type: ApplicationCommandOptionType.Subcommand,
    run: async({ interaction }) => {
        interaction.reply('Test command')
    }
})