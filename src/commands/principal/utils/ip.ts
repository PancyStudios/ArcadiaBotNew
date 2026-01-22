import { Command } from "../../../structures/CommandSlashSimple";
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default new Command({
    name: 'ip',
    description: 'Muestra la ip del servidor',

    
    run: async ({ interaction }) => {
        const embed = new EmbedBuilder()
        .setTitle('📶 | IP del servidor')
        .setDescription(`🌐 - IP: \`arcanetwork.ddns.net\`
        🛜 - PUERTO: \`19132\`
        📶 - Versión: \`1.21.130\`
        
        📩 - **Nota:** \`El servidor es unicamente minecraft bedrock\``)
        .setColor('Purple')
        .setFooter({ text: '💫 - Developed by PancyStudios' })

        const button = new ButtonBuilder()
        .setCustomId('status')
        .setLabel('Estado del servidor')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🌿')

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button)
        
        await interaction.reply({ embeds: [embed], components: [actionRow] })
    }
})