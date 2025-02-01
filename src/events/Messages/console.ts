import { Event } from "../../structures/Event";
import { EmbedBuilder, TextChannel } from "discord.js";

export default new Event('messageCreate', async(message) => {
    if(!message.author.bot) return;
    if(message.channelId !== '1122739604055920713') return;
    const {content} =  message
    const channel = await message.guild?.channels.fetch('1165112619645026385').catch(() => null) as TextChannel;
    if (!channel) return;
    
    const regex = /\d{2}:\d{2}:\d{2} Server\|INFO > Arcadia RolePlay g>> ([\w\s]+) Ha entrado por primera vez al servidor! Bienvenido!/g;

    const matchAll = Array.from(content.matchAll(regex));
    if (matchAll.length === 0) return;
    await channel.sendTyping();
    setTimeout(() => {
        for (const match of matchAll) {
            const gamertag = match[1];
            const EmbedNewUser = new EmbedBuilder()
            .setTitle('👤 | Jugador nuevo')
            .setDescription(`Un nuevo jugador ha entrado al servidor\n🎮 - **Gamertag:** ${gamertag}`)
            .setColor('Green')
            .setFooter({ text: '💫 - Developed by PancyStudios' })
            .setTimestamp()
    
            channel.send({ embeds: [EmbedNewUser], content: '<@&901310576687448114> <@&827543069594222612> <@&901306576403591178> <@&827542979522461768>'})
        }
    }, 5000)
})