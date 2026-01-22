import { Command } from "../../../../structures/SubCommandSlash.js";
import {ApplicationCommandOptionType, ChannelType, EmbedBuilder} from "discord.js";
import { db } from "../../../../index.js";

export default new Command({
	name: 'setrandomnumber_channel',
	description: 'Establece el canal para los números aleatorios',
	type: ApplicationCommandOptionType.Subcommand,
	options: [
		{
			name: 'channel',
			description: 'Canal para los números aleatorios',
			type: ApplicationCommandOptionType.Channel,
			required: true,
			channelTypes: [ChannelType.GuildText]
		}
	],
	userPermissions: ['Administrator'],

	run: async ({ interaction, args, client }) => {
		const channel = args.getChannel('channel', true, [ChannelType.GuildText]);
		const { guildId } = interaction
		if (channel.permissionsFor(interaction.guild.members.cache.get(client.user.id)).has('SendMessages')) {
			const Data = await db.guilds.findOne({ guildId: guildId })
			if (!Data) { return interaction.reply({ embeds: [EmbedErrorNoData], flags: ['Ephemeral'] }) }

			if (!Data.settings.randomNumber) {
				Data.settings.randomNumber = {
					channel: channel.id,
					min: 1,
					max: 3000,
					number: null
				}
			} else {
				Data.settings.randomNumber.channel = guildId
			}
			await Data.save()

			const EmbedSuccess = new EmbedBuilder()
				.setTitle('✅ | Canal de números aleatorios establecido')
				.setDescription(`El canal para los números aleatorios ha sido establecido correctamente en <#${channel.id}>`)
				.setColor('Green')
				.setTimestamp()
				.setFooter({ text: `💫 - Developed by PancyStudios` })
			return interaction.reply({ embeds: [EmbedSuccess], flags: ['Ephemeral'] })
		} else {
			return interaction.reply({ embeds: [EmbedErrorPermissionChannel], flags: ['Ephemeral'] })
		}
	}
})

const EmbedErrorNoData = new EmbedBuilder()
	.setTitle('⚠️ | Datos no encontrados')
	.setDescription('No se han encontrado los datos del servidor en la base de datos\n\nSolicita al desarrollador del bot que reinicie el bot')
	.setColor('Red')
	.setTimestamp()
	.setFooter({ text: `💫 - Developed by PancyStudios` })

const EmbedErrorPermissionChannel = new EmbedBuilder()
	.setTitle('⚠️ | Permisos insuficientes')
	.setDescription('No tengo los permisos suficientes para enviar mensajes en el canal establecido')
	.setColor('Red')
	.setTimestamp()
	.setFooter({ text: `💫 - Developed by PancyStudios` })