import { Event } from "../../structures/Event";
import { AuditLogEvent, EmbedBuilder, TextChannel } from "discord.js";
import { clientExtend as client } from "../..";
import { db } from "../..";

export default new Event('guildBanAdd',async userBan => {
    userBan.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })
    .then(async audit => {
        const ban = audit.entries.filter(entry => entry.target.id === userBan.user.id).first();

        const embedBuilder = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`🔨 - Nuevo baneo registrado`)
        .setDescription(`Un nuevo usuario a sido baneado del servidor: `)
        .setFields([
            {
                name: '> **Usuario Baneado:**',
                value: `> \`${userBan.user.tag} (${userBan.user.id})\``
            },
            {
                name: '> **Autor del baneo:**',
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
        const guild = await guilds.findOne({ guildId: userBan.guild.id })
        const globalDb = await global.findOne({ botId: client.user.id })

        if(!guild) return;
        if(!globalDb) return;

        const channel = await userBan.guild.channels.fetch(guild.settings.logs.channel).catch(() => {}) as TextChannel
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