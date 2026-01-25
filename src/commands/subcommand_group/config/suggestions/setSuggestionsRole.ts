import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../..";
import { db } from "../../../..";
import { version } from '../../../../../package.json'

export default new Command({
		name: 'set_manage_role',
		description: 'Establece el rol para gestionar las sugerencias',
		options: [
			{
				name: 'role',
				description: 'Rol para gestionar las sugerencias',
				type: ApplicationCommandOptionType.Role,
				required: true,
			}
		],
		type: ApplicationCommandOptionType.Subcommand,
		userPermissions: ['Administrator'],

		run: async ({ interaction, args }) => {
			const role = args.getRole('role', true);
			const {guildId} = interaction;
			try {
				const guildDb = await db.guilds.findOne({guildId});

				guildDb.settings.suggestions.roleGestion = role.id;
				await guildDb.save();

				const SuccessEmbed = new EmbedBuilder()
					.setTitle('✅ | Rol de gestión de sugerencias establecido')
					.setDescription(`El rol para gestionar las sugerencias ha sido establecido correctamente en <@&${role.id}>`)
					.setColor('Green')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

				interaction.reply({embeds: [SuccessEmbed], flags: ['Ephemeral']})

			} catch (err) {
				const ErrEmbed = new EmbedBuilder()
					.setTitle('⚠️ | Un error inesperado ha ocurrido')
					.setDescription(`Algo ha salido mal al intentar guardar el rol\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
					.setColor('Red')
					.setTimestamp()
					.setFooter({text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

				interaction.reply({embeds: [ErrEmbed], flags: ['Ephemeral']})
				errorManager.reportError(err, 'src/commands/subcommand_group/config/suggestions/setSuggestionsRole.ts')
			}
		}
})