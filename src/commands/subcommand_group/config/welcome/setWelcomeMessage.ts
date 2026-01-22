import { Command } from "../../../../structures/SubCommandSlash.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../../index.js";
import { db } from "../../../../index.js";
import { version } from '../../../../../package.json' with { type: "json" }

export default new Command({
    name: 'set_message',
    description: 'Establece el mensaje de bienvenidas',
    options: [
        {
            name: 'message',
            description: 'Mensaje de bienvenidas',
            type: ApplicationCommandOptionType.String,
            required: true,
            max_length: 2000
        }
    ],

    type: ApplicationCommandOptionType.Subcommand,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],

    run: async ({ interaction, client, args }) => {
        const message = args.getString('message');
        const { guildId } = interaction;
        try {
            const guildDb = await db.guilds.findOne({ guildId });

            guildDb.settings.welcome.message = message;
            await guildDb.save();

            const SuccessEmbed = new EmbedBuilder()
            .setTitle('✅ | Mensaje de bienvenidas establecido')
            .setDescription(`El mensaje de bienvenidas ha sido establecido correctamente`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            interaction.reply({ embeds: [SuccessEmbed], ephemeral: true })                              
        } catch (err) {
            const ErrEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Un error inesperado ha ocurrido')
            .setDescription(`Algo ha salido mal al intentar guardar el mensaje\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
            errorManager.reportError(err, 'src/subcommand_group/config/welcome/setWelcomeMessage.ts')
        }
    }
})