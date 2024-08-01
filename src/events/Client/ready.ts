import { Event } from "../../structures/Event";
import { ActivityType } from 'discord.js';
import { InstallGuild } from "../../utils/func";

export default new Event('ready', async(client) => {
    console.debug(`Bot listo como ${client.user.tag}`);

    let Activities = [
        {
            name: '⚒️ | ArcasBot en desarrollo',
            type: ActivityType.Playing
        },
        {
            name: '🌐 | Arcadia Network',
            type: ActivityType.Watching
        },
        {
            name: '🌟 | Arcadia RolePlay',
            type: ActivityType.Playing
        }, 
        {
            name: '💫 | ArcasStudio / PancyStudios',
            type: ActivityType.Streaming
        }
    ]
    
    client.user.setPresence({
        status: 'dnd',
        activities: [
            {
                name: '⚒️ | ArcasBot en desarrollo',
                type: ActivityType.Watching
            }
        ]
    })

    setInterval(() => {
        let random = Math.floor(Math.random() * Activities.length)
        client.user.setPresence({
            status: 'dnd',
            activities: [
                Activities[random]
            ]
        })
    }, 1000 * 30)

    client.guilds.cache.forEach(async guild => {
        console.log(`Instalando ${guild.name} (${guild.id})`, 'GUILD')
        await InstallGuild(guild)
    })
})