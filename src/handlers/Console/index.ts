import { version as DiscordJSVersion} from "discord.js"
import { version as TypeScriptVersion } from "typescript"
import { cachedDataVersionTag } from "v8"
import { totalmem, freemem} from "os"

export default class ConsoleHandler {
    constructor() {
        console.log(`Iniciando consola`)
        // Aqui al iniciar la consola que muestre algunas especificaciones del sistema, es nodejs y discordjs

        console.log(`Sistema operativo: ${process.platform}`)
        console.log(`Version de Node: ${process.version}`)
        console.log(`Version de Discord.js: ${DiscordJSVersion}`)
        console.log(`Version de TypeScript: ${TypeScriptVersion}`)
        console.log(`Version de V8: ${cachedDataVersionTag()}`)
    }
}