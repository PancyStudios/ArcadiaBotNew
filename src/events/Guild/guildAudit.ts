import { Event } from "../../structures/Event";
import {clientExtend as client, db} from "../../index";
import {AuditLogEvent, EmbedBuilder, TextChannel, User} from "discord.js";

export default new Event('guildAuditLogEntryCreate', async (auditLog, guild) => {
		console.log(`Nueva entrada en el registro de auditoría TYPE: ${auditLog.action} en el servidor ${guild.name} (${guild.id})`, 'GuildAuditLog')
	const guildDb = await db.guilds.findOne({ guildId: guild.id })
	const globalDb = await db.global.findOne({ botId: guild.client.user.id });

	const user = auditLog.target as User;
	const userExecutor = auditLog.executor;
	const reason = auditLog.reason;

	const channel = await guild.channels.fetch(guildDb.settings.logs.channel).catch(() => {}) as TextChannel
	const globalChannel = await client.channels.fetch(globalDb.BansAndkickGlobalRegister).catch(() => {}) as TextChannel

	console.debug(`Proceso de entrada\n\nCanal local: ${channel?.id || 'No definido'}\nCanal global: ${globalChannel?.id || 'No definido'}`, 'GuildAuditLog')

	if(global.BansAndkickGlobalRegister) {
		switch (auditLog.action) {
			case AuditLogEvent.MemberBanAdd:
				const embedBuilder = new EmbedBuilder()
					.setColor('Red')
					.setTitle(`🔨 - Nuevo baneo registrado`)
					.setDescription(`Un nuevo usuario a sido baneado del servidor: `)
					.setFields([
						{
							name: '> **Usuario Baneado:**',
							value: `> \`${user.tag} (${user.id})\``
						},
						{
							name: '> **Autor del baneo:**',
							value: `> \`${userExecutor.tag} (${userExecutor.id})\``
						},
						{
							name: '> **Razón del baneo:**',
							value: `\`\`\`txt\n${reason || 'Sin razón'}\`\`\``
						},
						{
							name: '🕒 Fecha:',
							value: `> \`<t:${Math.floor(Date.now() / 1000)}>\``,
							inline: true
						}
					])
					.setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
					if(globalChannel) await globalChannel.send({ embeds: [embedBuilder] }).catch((e) => { console.error(e) })
					if(channel) await channel?.send({ embeds: [embedBuilder] }).catch((e) => { console.error(e) })
				break;
			case AuditLogEvent.MemberBanRemove:
				const embedUnBanBuilder = new EmbedBuilder()
					.setColor('Red')
					.setTitle(`🔨 - Nuevo UnBan registrado`)
					.setDescription(`Un nuevo usuario a sido desbaneado del servidor: `)
					.setFields([
						{
							name: '> **Usuario desbaneado:**',
							value: `> \`${user.tag} (${user.id})\``
						},
						{
							name: '> **Autor del desbaneo:**',
							value: `> \`${userExecutor.tag} (${userExecutor.id})\``
						},
						{
							name: '🕒 Fecha:',
							value: `> \`<t:${Math.floor(Date.now() / 1000)}>\``,
							inline: true
						}
					])
					.setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
				if(globalChannel) await globalChannel.send({ embeds: [embedUnBanBuilder] }).catch((e) => { console.error(e) })
				if(channel) await channel?.send({ embeds: [embedUnBanBuilder] }).catch((e) => { console.error(e) })
				break;
			case AuditLogEvent.MemberKick:
				const embedKickBuilder = new EmbedBuilder()
					.setColor('Red')
					.setTitle(`🔨 - Miembro expulsado registrado`)
					.setDescription(`Un usuario a sido expulsado del servidor: `)
					.setFields([
						{
							name: '> **Usuario Expulsado:**',
							value: `> \`${user.tag} (${user.id})\``
						},
						{
							name: '> **Autor:**',
							value: `> \`${userExecutor.tag} (${userExecutor.id})\``
						},
						{
							name: '> **Razón de la Expulsion:**',
							value: `\`\`\`txt\n${reason || 'Sin razón'}\`\`\``
						},
						{
							name: '🕒 Fecha:',
							value: `> \`<t:${Math.floor(Date.now() / 1000)}>\``,
							inline: true
						}
					])
					.setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
				if(globalChannel) await globalChannel.send({ embeds: [embedKickBuilder] }).catch((e) => { console.error(e) })
				if(channel) await channel?.send({ embeds: [embedKickBuilder] }).catch((e) => { console.error(e) })
				break;
			default:
				console.debug('Acción de registro de auditoría no manejada en el sistema de logs globales.', 'GuildAuditLog')
				break;
		}
	}
})