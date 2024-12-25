import { Command } from "../../../structures/CommandSlashSimple";
import { EmbedBuilder } from "discord.js";

export default new Command({
    name: 'ip',
    description: 'Muestra la ip del servidor',
    
    
    run: async ({ interaction }) => {
        const embed = new EmbedBuilder()
        .setTitle('📶 | IP del servidor')
        .setDescription(`🌐 - IP: \`arcadianetwork.ddns.net\`
        🛜 - PUERTO: \`19192\`
        📶 - Versión: \`1.21.50\`
        
        📩 - **Nota:** \`El servidor es unicamente minecraft bedrock\``)
        .setColor('Purple')
        .setFooter({ text: '💫 - Developed by PancyStudios' })
        
        await interaction.reply({ embeds: [embed] })
    }
})