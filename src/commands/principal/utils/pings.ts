import { Command } from "../../../structures/CommandSlashSimple"
import { db } from "../../.."
import { EmbedBuilder } from "discord.js"

export default new Command({
    name: 'ping',
    description: 'Muestra la latencia del bot',

    run: async ({ interaction, client }) => {
        await interaction.reply({ content: 'Obteniendo ping...' })
        const msg = await interaction.fetchReply()
        const dbPing = await db.ping()
        const ping = msg.createdTimestamp - interaction.createdTimestamp

        const embedPing = new EmbedBuilder()
        .setTitle('📶 - Latencia')
        .setDescription(`🌐 - Ping WS: \`${client.ws.ping}ms\`\n📩 - Ping Messages: \`${ping}ms\`\n🍃 - Ping MongoDB: \`${dbPing}ms\``)
        .setColor('Purple')
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: client.user.avatarURL() })
        
        await interaction.editReply({ embeds: [embedPing] })
    }
})