import { Event } from "../../structures/Event.js";

export default new Event('guildUnavailable', async guild => { 
    console.warn(`El servidor ${guild.name} (${guild.id}) no está disponible por el momento`, 'DC')
})