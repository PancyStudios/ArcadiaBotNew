import { version as DiscordJSVersion} from "discord.js"
import { version as TypeScriptVersion } from "typescript"
import { totalmem, freemem} from "os"

export default class ConsoleHandler {
    constructor() {
        console.log('Iniciando consola')
        // Aqui al iniciar la consola que muestre algunas especificaciones del sistema, es nodejs y discordjs

        console.log('Sistema operativo:', process.platform)
        console.log('Version de Node:', process.version)
        console.log('Version de Discord.js:', DiscordJSVersion)
        console.log('Version de TypeScript:', TypeScriptVersion)

        // Que muestre especificaciones del sistema, como la cantidad de memoria que esta usando el bot
        console.log('CPU:', process.cpuUsage())
        console.log('Memoria usada:', process.memoryUsage())
        console.log('Memoria total:', totalmem)
        console.log('Memoria libre:', freemem)


        console.log('Consola lista')
    }
}