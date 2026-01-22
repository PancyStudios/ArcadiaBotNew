import { Event } from "../../structures/Event";
import { ActivityType } from 'discord.js';
import { InstallGuild } from "../../utils/func";
import { clientExtend } from "../..";
import { db } from "../..";
import { version } from "../../../package.json";

export default new Event('clientReady', async(client) => {
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
        },
        {
            name: `📚 | ArcasBot v${version}`,
            type: ActivityType.Listening
        }
    ]
    
    client.user.setPresence({
        status: 'idle',
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
            status: 'idle',
            activities: [
                Activities[random]
            ]
        })
    }, 1000 * 30)

    client.guilds.cache.forEach(async guild => {
        console.log(`Instalando ${guild.name} (${guild.id})`, 'GUILD')
        await InstallGuild(guild)
    })

    try {
        const { guilds, global } = db
        const globalDb = await global.findOne({ botId: client.user.id })
        if(!globalDb) new global({ botId: client.user.id, WarnsGlobalRegister: null, BansAndkickGlobalRegister: null}).save()
        const guildsDb = await guilds.find({})
        guildsDb.forEach(async guild => {
            const roleid = guild.settings.botAccess
            if(!roleid) return;
            clientExtend.setBotAccessRoleIdCache(roleid)
        })
    } catch (err) {
        return console.error(err)
    }

    console.debug('Iniciando recarga de sugerencias')
    const { suggestions } = db
    const suggestionsDb = await suggestions.find({})
    suggestionsDb.forEach(async suggestion => {
        const { channelId, messageId, _id } = suggestion
        const channel = await client.channels.fetch(channelId).catch(() => null)
        if(!channel) return console.warn(`No se encontro el canal de la sugerencia ${_id}`); 
        const message = await channel.messages.fetch(messageId).catch(() => null)
        if(!message) return console.warn(`No se encontro el mensaje de la sugerencia ${_id}`);
        console.debug(`La sugerencia ${_id} ha sido recargada`)
    })
})