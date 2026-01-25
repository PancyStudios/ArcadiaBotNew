import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../../index";
import { db } from "../../../../index";
import { version } from '../../../../../package.json'

export default new Command({
	name: 'set_suggestionsadmin_channel',
	description: 'Establece el canal de log de sugerencias',
	options: [
		{
			name: 'channel',
			description: 'Canal de log de sugerencias',
			type: ApplicationCommandOptionType.Channel,
			required: true,
			channelTypes: [ChannelType.GuildText]
		}
	],
	type: ApplicationCommandOptionType.Subcommand,
	userPermissions: ['Administrator'],

	run: async ({ interaction, client, args }) => {
		const channel = args.getChannel('channel', true, [ChannelType.GuildText]);
		const { guildId } = interaction;
		try {
			const guildDb = await db.guilds.findOne({ guildId });

			const NomPermsEmbed = new EmbedBuilder()
				.setTitle('⚠️ | Permisos insuficientes')
				.setDescription('No tengo los permisos suficientes para enviar mensajes en el canal establecido')
				.setColor('Red')
				.setTimestamp()
				.setFooter({ text: `💫 - Developed by PancyStudio` })

			if(!channel.permissionsFor(interaction.guild.members.cache.get(client.user.id)).has('SendMessages')) return interaction.reply({ embeds: [NomPermsEmbed], flags: ['Ephemeral'] })

			guildDb.settings.suggestions.adminChannel = channel.id;
			await guildDb.save();

			const SuccessEmbed = new EmbedBuilder()
				.setTitle('✅ | Canal de sugerencias establecido')
				.setDescription(`El canal de log de sugerencias ha sido establecido correctamente en <#${channel.id}>`)
				.setColor('Green')
				.setTimestamp()
				.setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

			interaction.reply({ embeds: [SuccessEmbed], flags: ['Ephemeral'] })
		} catch (err) {
			const ErrEmbed = new EmbedBuilder()
				.setTitle('⚠️ | Un error inesperado ha ocurrido')
				.setDescription(`Algo ha salido mal al intentar guardar el canal\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
				.setColor('Red')
				.setTimestamp()
				.setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

			interaction.reply({ embeds: [ErrEmbed], flags: ['Ephemeral'] })
			errorManager.reportError(err, 'src/subcommand_group/admin/suggestions/setSuggestionsAdminChannel.ts')
		}
	}
})