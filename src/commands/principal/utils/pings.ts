import { Command } from "../../../structures/CommandSlashSimple"
import { db } from "../../.."
import { EmbedBuilder } from "discord.js"
export default new Command({
    name: 'ping',
    description: 'Ping del bot y DB',

    run: async ({ interaction, client }) => {
        await interaction.reply({ content: 'Obteniendo ping...' })
        const msg = await interaction.fetchReply()
        const dbPing = await db.ping()
        const ping = msg.createdTimestamp - interaction.createdTimestamp

        const embedPing = new EmbedBuilder()
        .setDescription(`🌐 - Discord WS: ${client.ws.ping}\n📩 - Ping Messages: ${ping}ms\n🏢 - Ping DB: ${dbPing}ms`)
        
        await interaction.editReply({ embeds: [embedPing] })
    }
})