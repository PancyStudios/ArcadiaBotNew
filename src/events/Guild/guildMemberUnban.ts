import { Event } from "../../structures/Event";
import { AuditLogEvent, EmbedBuilder, TextChannel } from "discord.js";
import { clientExtend as client } from "../..";
import { db } from "../..";

export default new Event('guildBanRemove', async userUnban => {
    userUnban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove })
    .then(async audit => {
        const ban = audit.entries.filter(entry => entry.target.id === userUnban.user.id).first();

        const embedBuilder = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`🔨 - Nuevo desbaneo registrado`)
        .setDescription(`Un nuevo usuario a sido desbaneado del servidor ${userUnban.guild.name}: `)
        .setFields([
            {
                name: '> **Usuario Desbaneado:**',
                value: `> \`${userUnban.user.tag} (${userUnban.user.id})\``
            },
            {
                name: '> **Autor del desbaneo:**',
                value: `> \`${ban.executor.tag} (${ban.executor.id})\``
            },
            {
                name: '> **Razón del baneo:**',
                value: `\`\`\`txt\n${ban.reason || 'Sin razón'}\`\`\``
            },
            {
                name: '🕒 Fecha:',
                value: `> \`<t:${Math.floor(Date.now() / 1000)}>\``,
                inline: true
            }
        ])
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })

        const { guilds, global } = db
        const guild = await guilds.findOne({ guildId: userUnban.guild.id })
        const globalDb = await global.findOne({ botId: client.user.id })

        if(!guild) return;
        if(!globalDb) return;

        const channel = await userUnban.guild.channels.fetch(guild.settings.logs.channel).catch(() => {}) as TextChannel
        const globalChannel = await client.channels.fetch(globalDb.BansAndkickGlobalRegister).catch(() => {}) as TextChannel

        if(!channel) return;
        if(!globalChannel) return;

        channel.send({ embeds: [embedBuilder] }).catch(() => {})
        globalChannel.send({ embeds: [embedBuilder] }).catch(() => {})
    })
    .catch((err) => {
        console.log(err);
        console.warn('No se pudo obtener el registro de auditoría del baneo')
    })
})