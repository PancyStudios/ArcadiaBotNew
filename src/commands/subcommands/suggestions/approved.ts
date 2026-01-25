import {
	LabelBuilder,
	TextInputBuilder,
	ModalBuilder,
	EmbedBuilder,
	TextInputStyle,
	TextDisplayBuilder
} from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../../index";
import {SuggestionStatus} from "../../../database/types/Suggestions";
import { version } from '../../../../package.json'

export default new Command({
	name: 'approved',
	description: 'Aprueba una sugerencia pendiente',
	options: [
		{
			name: 'suggestion_id',
			description: 'ID de la sugerencia a aprobar',
			type: 3, // ApplicationCommandOptionType.String
			required: true,
		}
	],
	type: 1, // ApplicationCommandOptionType.Subcommand
	userPermissions: ['ManageGuild'],
	auto: async ({ interaction, args }) => {
		const focus = args.getFocused(true)
		if (focus.name !== 'suggestion_id') return;
		const { guildId } = interaction;
		const { suggestions } = db;
		const suggestionDb = await suggestions.find({ guildId: guildId });

		const choices = suggestionDb
			.filter(suggestion => suggestion.status === SuggestionStatus.Pending || suggestion.status === SuggestionStatus.InProgress)
			.map(suggestion => {
				return suggestion._id.toString()
			})
		const filtered = choices.filter(choice => choice.startsWith(focus.value)).slice(0, 25);
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	run: async ({ interaction, args }) => {
		const suggestionId = args.getString('suggestion_id');
		const {guildId} = interaction;
		const {suggestions} = db;

		try {
			const suggestionDb = await suggestions.findOne({guildId, suggestionId : suggestionId});
			if (!suggestionDb) {
				const NotFoundEmbed = new EmbedBuilder()
					.setTitle('⚠️ | Sugerencia no encontrada')
					.setDescription(`No se ha encontrado ninguna sugerencia pendiente con la ID \`${suggestionId}\``)
					.setColor('Red')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio`})

				return interaction.reply({embeds: [NotFoundEmbed], flags: ['Ephemeral'] });
			}
			if (suggestionDb?.status === SuggestionStatus.Pending || suggestionDb?.status === SuggestionStatus?.InProgress) {
				const { suggestion, authorId, date, upVotes, downVotes, messageId } = suggestionDb;
				const Modal = new ModalBuilder()
					.setTitle('✅ | Aprobar sugerencia')
					.setCustomId(`approve_suggestion_modal_${suggestionId}`);

				const TextView = new TextDisplayBuilder()
					.setContent('La sugerencia sera aprobada y se notificará al autor. Puedes añadir un comentario opcional abajo. En caso de que no quieras añadir un comentario, simplemente envía el formulario vacío.')

				const CommentInput = new TextInputBuilder()
					.setCustomId('approve_suggestion_comment')
					.setPlaceholder('Añade un comentario (opcional)')
					.setStyle(TextInputStyle.Paragraph)
					.setMaxLength(500)
					.setMinLength(0)
					.setRequired(false)

				const CommentLabel = new LabelBuilder()
					.setLabel('Comentario')
					.setTextInputComponent(CommentInput);

				Modal.addTextDisplayComponents(TextView)
				Modal.addLabelComponents(CommentLabel);

				 await interaction.showModal(Modal);

				const ModalResponse = await interaction.awaitModalSubmit({ time: 120_000, filter: (i) => i.customId === `approve_suggestion_modal_${suggestionId}` }).catch(() => {
					interaction.editReply({ content: 'Tiempo de espera agotado / No se recibio una respuesta', components: [] })
				})
				if(!ModalResponse) return

				const comment = ModalResponse.fields.getTextInputValue('approve_suggestion_comment') || 'Sin comentarios';

				const ApprovedEmbedAdmin = new EmbedBuilder()
					.setTitle('✅ | Sugerencia aprobada')
					.setDescription(`La sugerencia con ID \`${suggestionId}\` ha sido aprobada correctamente`)
					.setColor('Green')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio`})

				await interaction.reply({embeds: [ApprovedEmbedAdmin], flags: ['Ephemeral']});

				const SuggestionEmbed = new EmbedBuilder()
					.setTitle('✅ | Sugerencia Aprobada')
					.setDescription(`\`\`\`${suggestion}\`\`\`\n📝 - **Estado:** \`Aprobada\`
            \n📅 - **Fecha:** \`${date.toLocaleDateString()}\`\n👤 - **Autor:** <@${authorId}>\n🔨 - **Aprobada por:** <@${interaction.user.id}>\n\n📊 - **Votos:**\n🔼 - **A favor:** \`${upVotes}\`\n🔽 - **En contra:** \`${downVotes}\`\n\n📃 - **Comentarios:** ${comment}`)
					.setColor('Green')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

				suggestionDb.adminComment = comment;
				suggestionDb.lastAdminId = interaction.user.id;
				suggestionDb.lastAction = 'approved';
				suggestionDb.status = SuggestionStatus.Approved;
				await suggestionDb.save();

				const msg = await interaction.channel?.messages.fetch(messageId);
				if(msg) {
					await msg.edit({embeds: [SuggestionEmbed]});
					await msg.reactions.removeAll()
				}

				const author = await interaction.guild?.members.fetch(authorId);
				if(author) {
					author.send({ embeds: [SuggestionEmbed]} ).catch(() => {
						const CannotDmEmbed = new EmbedBuilder()
							.setTitle('⚠️ | No se ha podido notificar al autor')
							.setDescription(`La sugerencia con ID \`${suggestionId}\` ha sido aprobada, pero no se ha podido notificar al autor <@${authorId}> ya que tiene los mensajes directos desactivados.`)
							.setColor('Red')
							.setTimestamp()
							.setFooter({text: `💫 - Developed by PancyStudio`})

						interaction.followUp({embeds: [CannotDmEmbed], flags: ['Ephemeral'] });
					})
				}
			} else {
				const AlreadyEmbed = new EmbedBuilder()
					.setTitle('⚠️ | Sugerencia no pendiente')
					.setDescription(`La sugerencia con ID \`${suggestionId}\` no esta en estado pendiente o en progreso y no puede ser aprobada`)
					.setColor('Red')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio`})

				return interaction.reply({embeds: [AlreadyEmbed], flags: ['Ephemeral'] });
			}
		} catch (err) {
			const ErrEmbed = new EmbedBuilder()
				.setTitle('⚠️ | Un error inesperado ha ocurrido')
				.setDescription(`Algo ha salido mal al intentar aprobar la sugerencia\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
				.setColor('Red')
				.setTimestamp()
				.setFooter({text: `💫 - Developed by PancyStudio`})

			interaction.reply({ embeds: [ErrEmbed], flags: ['Ephemeral'] });
		}
	}
})