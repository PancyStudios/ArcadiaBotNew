import { Command } from "../../../structures/CommandSlashSimple";
import {
    EmbedBuilder,
    TextChannel,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder, LabelBuilder
} from "discord.js";
import { errorManager } from "../../..";
import { db } from "../../..";
import { version } from '../../../../package.json'
import { SuggestionStatus } from "../../../database/types/Suggestions";

export default new Command({
    name: 'suggest',
    description: 'Sugiere algo para el servidor',
    isBeta: true,
    
    run: async ({ interaction, client }) => {
        try {
            const GuildDb = await db.guilds.findOne({ guildId: interaction.guildId })
            const NotChannelEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Canal de sugerencias no establecido')
            .setDescription('El canal de sugerencias no ha sido establecido en este servidor, por favor contacta con un administrador para que lo establezca')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            const NotFoundChannelEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Canal de sugerencias no encontrado')
            .setDescription('El canal de sugerencias establecido no ha sido encontrado, por favor contacta con un administrador para que lo establezca de nuevo')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            const channelId = GuildDb?.settings?.suggestions?.suggestionsChannel
            if(!channelId) return interaction.reply({ embeds: [NotChannelEmbed], ephemeral: true })
            
            const channel = interaction.guild.channels.cache.get(channelId) as TextChannel
            if(!channel) return interaction.reply({ embeds: [NotFoundChannelEmbed], ephemeral: true })

            const NotPermissionsEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Permisos insuficientes')
            .setDescription('No tengo permisos suficientes para enviar mensajes en el canal de sugerencias, por favor contacta con un administrador para que me los de')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            if(!channel.permissionsFor(interaction.guild.members.cache.get(client.user.id))?.has('SendMessages')) return interaction.reply({ embeds: [NotPermissionsEmbed], ephemeral: true })

            const SuggestionModal = new ModalBuilder()
            .setTitle('📩 | Nueva sugerencia')
            .setCustomId('suggestion')

    
            const SuggestEntry = new TextInputBuilder()
            .setCustomId('suggestion_text')
            .setPlaceholder('Escribe tu sugerencia aquí')
            .setMinLength(10)
            .setMaxLength(2000)
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)

            const SuggestLabel = new LabelBuilder()
              .setLabel('Sugerencia')
              .setTextInputComponent(SuggestEntry);
    
            SuggestionModal.addLabelComponents([SuggestLabel])
    
            await interaction.showModal(SuggestionModal)
            const response = await interaction.awaitModalSubmit({ time: 240_000, filter: (i) => i.user.id === interaction.user.id && i.customId === 'suggestion' })
            const suggestionUnfilter = response.fields.getTextInputValue('suggestion_text')
    
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const suggestion = suggestionUnfilter.replace(urlRegex, '[URL]')


            const data = await db.suggestions.create({
                authorId: interaction.user.id,
                suggestion: suggestion,
                guildId: interaction.guildId,
                lastAction: 'none',
                lastAdminId: client.user.id,
                status: SuggestionStatus.Pending,
                date: new Date(),
                upVotes: 0,
                downVotes: 0
            })

            const SuccessEmbed = new EmbedBuilder()
            .setTitle('✅ | Sugerencia enviada')
            .setDescription(`Tu sugerencia ha sido enviada correctamente\n\`\`\`${suggestion}\`\`\``)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

            const SuggestionEmbed = new EmbedBuilder()
            .setTitle('📩 | Nueva sugerencia')
            .setDescription(`\`\`\`${suggestion}\`\`\`
            📝 - **Estado:** \`Pendiente\`
            📅 - **Fecha:** \`${new Date().toLocaleDateString()}\`
            👤 - **Autor:** <@${interaction.user.id}>
            
            📊 - **Votos:**
            🔼 - **A favor:** \`0\`
            🔽 - **En contra:** \`0\``)
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            const Menu = new StringSelectMenuBuilder()
            .setCustomId('suggest')
            .setPlaceholder('Selecciona una opción')
            .addOptions([
                {
                    label: 'Abrir menu administrativo',
                    value: 'change_status',
                    description: 'Abre el menu para aprobar/rechazar/marcar [STAFF ONLY]',
                    emoji: '🔧'
                },
                {
                    label: 'Eliminar sugerencia',
                    value: 'delete_suggestion',
                    description: 'Elimina la sugerencia [AUTHOR ONLY / STAFF ONLY]',
                    emoji: '❌'
                },
            ])

            const ActionRow2 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(Menu)


            const message = await channel.send({ embeds: [SuggestionEmbed], components: [ActionRow2] })
            await message.react('🔼')
            await message.react('🔽')
            const messageLast = await response.reply({ embeds: [SuccessEmbed], ephemeral: true })
            data.messageId = messageLast.id
            await data.save()
            console.debug(`Suggestion created: ${data._id}`)
        } catch (err) {
            const ErrEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Un error inesperado ha ocurrido')
            .setDescription(`Algo ha salido mal al intentar mandar tu sugerencia\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            interaction.isRepliable() ? interaction.channel.send({ embeds: [ErrEmbed]}) : interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
            errorManager.reportError(`${err}`, 'src/commands/principal/utils/suggestion.ts')
        }
    }
})