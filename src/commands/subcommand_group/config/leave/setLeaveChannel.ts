import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../..";
import { db } from "../../../..";
import { version } from '../../../../../package.json'

export default new Command({
    name: 'set_status',
    description: 'Establece el estado de las salidas',
    options: [
        {
            name: 'status',
            description: 'Estado de las salidas',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        }
    ],
    type: ApplicationCommandOptionType.Subcommand,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],

    run: async ({ interaction, args }) => {
        const status = args.getBoolean('status');
        const { guildId } = interaction;
        try {
            const guildDb = await db.guilds.findOne({ guildId });

            guildDb.modules.welcome = status;
            await guildDb.save();
            const SuccessEmbed = new EmbedBuilder()
              .setTitle('✅ | Estado de salidas establecido')
              .setDescription(`El estado de las salidas ha sido establecido correctamente a \`${status ? 'Activado' : 'Desactivado'}\``)
              .setColor('Green')
              .setTimestamp()
              .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            await interaction.reply({ embeds: [SuccessEmbed], flags: ['Ephemeral'] })
        } catch (err) {
            const ErrEmbed = new EmbedBuilder()
              .setTitle('⚠️ | Un error inesperado ha ocurrido')
              .setDescription(`Algo ha salido mal al intentar guardar el estado\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
              .setColor('Red')
              .setTimestamp()
              .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            await interaction.reply({ embeds: [ErrEmbed], flags: ['Ephemeral'] })
            errorManager.reportError(err, 'src/subcommand_group/config/welcome/setStatusWelcome.ts')
        }
    }
})