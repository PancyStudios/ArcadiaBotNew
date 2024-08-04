import { Event } from "../../structures/Event";
import { AuditLogEvent, EmbedBuilder } from "discord.js";
import { clientExtend as client } from "../..";

export default new Event('guildBanAdd', userBan => {
    userBan.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })
    .then(audit => {
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
            }
        ])
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
    })
    .catch((err) => {
        console.log(err);
        console.warn('No se pudo obtener el registro de auditoría del baneo')
    })
})