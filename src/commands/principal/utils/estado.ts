import axios from 'axios'
import { Command } from '../../../structures/CommandSlashSimple'
import { Status, StatusOnline } from '../../../typings/Status'
import { EmbedBuilder } from 'discord.js'

export default new Command({
    name: 'estado',
    description: '> Muestra el estado del servidor',
    
    run: async({ interaction }) => {
        //https://api.mcsrvstat.us/3/
        await interaction.reply('⌛ | Obteniendo estado del servidor...')
        const { data } = await axios.get<Status>(`https://api.mcsrvstat.us/3/${process.env.ipMc}`)
        switch(data.online) {
            case true: 
                const dataOnline = data as StatusOnline
                const EmbedNotPlayersOnline = new EmbedBuilder()
                .setTitle('Arcadia Roleplay')
                .setDescription(`Estado del servidor: 🟢 | **En linea**\n
                    Version del servidor: **${dataOnline.version}\n
                    Jugadores en linea **${dataOnline.players.online}/${dataOnline.players.max}**\n
                    Lista de jugadores: **\`\`\`${dataOnline.players.list?.map(player => player.name).join(' ') ?? "Ningun jugador conectado"}\`\`\`**`)
                .setFooter({ text: '💫 - Developed by PancyStudio', iconURL: interaction.guild.iconURL() })
                .setColor('Green')
                .setTimestamp()
                await interaction.editReply({ embeds: [EmbedNotPlayersOnline], content: '' })
                break;
            case false:
                const EmbedNotPlayersOffline = new EmbedBuilder()
                .setTitle('Arcadia Roleplay')
                .setDescription(`Estado del servidor: 🔴 | **Apagado**\n
                    Version del servidor: **N/A**\n
                    Jugadores en linea **0/0**\n
                    Lista de jugadores: \`\`\`Ningun jugador conectado\`\`\``)
                .setFooter({ text: '💫 - Developed by PancyStudio', iconURL: interaction.guild.iconURL() })
                .setColor('Red')
                .setTimestamp()
                await interaction.editReply({ embeds: [EmbedNotPlayersOffline], content: '' })
                break;
        }
    }
})