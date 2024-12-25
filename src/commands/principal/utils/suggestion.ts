import { Command } from "../../../structures/CommandSlashSimple";
import { EmbedBuilder, ApplicationCommandOptionType, TextChannel, Integration } from "discord.js";
import { errorManager } from "../../..";
import { db } from "../../..";
import { version } from '../../../../package.json'
import { SuggestionStatus } from "../../../database/types/Suggestions";

export default new Command({
    name: 'suggest',
    description: 'Sugiere algo para el servidor',
    options: [
        {
            name: 'sugerencia',
            description: 'Sugerencia que quieres dar',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    
    run: async ({ interaction, client, args }) => {
        const suggestionUnfilter = args.getString('sugerencia')

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const suggestion = suggestionUnfilter.replace(urlRegex, '[URL]')

        try {
            const GuildDb = await db.guilds.findOne({ guildId: interaction.guildId })
            await db.suggestions.create({
                authorId: interaction.user.id,
                suggestion: suggestion,
                guildId: interaction.guildId,
                lastAction: 'none',
                lastAdminId: client.user.id,
                status: SuggestionStatus.Pending,
                date: new Date()
            })

            const SuccessEmbed = new EmbedBuilder()
            .setTitle('✅ | Sugerencia enviada')
            .setDescription(`Tu sugerencia ha sido enviada correctamente\n\n\`\`\`${suggestion}\`\`\``)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            const SuggestionEmbed = new EmbedBuilder()
            .setTitle('📩 | Nueva sugerencia')
            .setDescription(`\`\`\`${suggestion}\`\`\``)
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            const NotChannelEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Canal de sugerencias no establecido')
            .setDescription('El canal de sugerencias no ha sido establecido en este servidor, por favor contacta con un administrador para que lo establezca')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            const NotFoundChannelEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Canal de sugerencias no encontrado')
            .setDescription('El canal de sugerencias establecido no ha sido encontrado, por favor contacta con un administrador para que lo establezca de nuevo')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            const channelId = GuildDb?.settings?.suggestions?.suggestionsChannel
            if(!channelId) return interaction.reply({ embeds: [NotChannelEmbed], ephemeral: true })
            
            const channel = interaction.guild.channels.cache.get(channelId) as TextChannel
            if(!channel) return interaction.reply({ embeds: [NotChannelEmbed], ephemeral: true })

            const NotPermissionsEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Permisos insuficientes')
            .setDescription('No tengo permisos suficientes para enviar mensajes en el canal de sugerencias, por favor contacta con un administrador para que me los de')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            if(!channel.permissionsFor(interaction.guild.members.cache.get(client.user.id))?.has('SendMessages')) return interaction.reply({ embeds: [NotPermissionsEmbed], ephemeral: true })

            await channel.send({ embeds: [SuggestionEmbed] })
            interaction.reply({ embeds: [SuccessEmbed], ephemeral: true })
        } catch (err) {
            const ErrEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Un error inesperado ha ocurrido')
            .setDescription(`Algo ha salido mal al intentar mandar tu sugerencia\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
            errorManager.reportError(err, 'src/commands/principal/utils/suggestion.ts')
        }
    }
})