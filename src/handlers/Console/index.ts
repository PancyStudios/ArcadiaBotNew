import { version as DiscordJSVersion} from "discord.js"
import { version as TypeScriptVersion } from "typescript"
import { cachedDataVersionTag } from "v8"
import { totalmem, freemem} from "os"

export default class ConsoleHandler {
    constructor() {
        console.log(`Iniciando consola`)
        // Aqui al iniciar la consola que muestre algunas especificaciones del sistema, es nodejs y discordjs

        console.info(`Sistema operativo: ${process.platform}`)
        console.info(`Version de Node: ${process.version}`)
        console.info(`Version de Discord.js: ${DiscordJSVersion}`)
        console.info(`Version de TypeScript: ${TypeScriptVersion}`)

        // Que muestre especificaciones del sistema, como la cantidad de memoria que esta usando el bot
        console.info(`CPU: ${process.cpuUsage().user}%`)
        console.info(`Memoria usada: ${process.memoryUsage().heapUsed}`)
        console.info(`Memoria total: ${totalmem}`)
        console.info(`Memoria libre: ${freemem}`)
    }
}