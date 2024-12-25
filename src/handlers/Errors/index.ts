import '../../utils/log'
import { WebhookClient, EmbedBuilder } from 'discord.js'
import { version } from '../../../package.json'
export class ErrorHandler {
    constructor() {
        process.on('uncaughtException', async (err, origin) => {
            console.error(err.message);
            console.error(origin);
        });
        process.on('unhandledRejection', async (reason, _promise) => {
            console.error(reason);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.error(err.message);
            console.error(origin);

        });
        process.on('warning', async (warning) => {
            console.warn(warning.name);
            console.warn(warning.message);
            console.warn(warning.stack || 'No stack');
            console.warn(warning.cause || 'No cause');
        });
        console.log('AntiCrash listo');
    }

    reportError(err: string, origin: string) {
        const webhook = new WebhookClient({ url: process.env.errorWebhook });
        const EmbedError = new EmbedBuilder()
        .setTitle('⚠️ | Un error inesperado ha ocurrido')
        .setDescription(`Algo ha salido mal\n\nError: \`${err}\`\nOrigen: \`${origin}\``)
        .setColor('Red')
        .setTimestamp()
        .setFooter({ text: `💫 - Developed by PancyStudio | Arcadia Bot v${version}`})

        webhook.send({ embeds: [EmbedError], content: 'Este mensaje fue generado automaticamente' });
    }
}