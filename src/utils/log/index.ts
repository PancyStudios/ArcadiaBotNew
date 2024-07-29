import chalk from "chalk";
import { DateTime } from "luxon";
import { WebhookClient, Colors, EmbedBuilder } from "discord.js";

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

let errors = 0;

function securityText(message: string): string {
    let messageStr = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
    messageStr = messageStr.replace(process.env.botToken, '[Secret Token]');
    return messageStr;
}

console.log = (message, prefix) => {
    const date = DateTime.now().setZone('America/Mexico_City');
    message = securityText(message);
    originalConsoleLog('[' + chalk.blue(prefix ? prefix : 'SYS') + '] : [' + chalk.green('INFO') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', message);
    discordLogger('log', message, prefix);
};

console.warn = (message, prefix) => {
    const date = DateTime.now().setZone('America/Mexico_City');
    message = securityText(message);
    originalConsoleLog('[' + chalk.blue(prefix ? prefix : 'SYS') + '] : [' + chalk.magenta('WARN') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', message);
    discordLogger('warn', message, prefix);
}

console.debug = (message, prefix) => {
    const date = DateTime.now().setZone('America/Mexico_City');
    message = securityText(message);
    originalConsoleLog('[' + chalk.blue(prefix ? prefix : 'SYS') + '] : [' + chalk.cyan('DEBUG') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', message);
    discordLogger('debug', message, prefix);
}

console.error = (message: Error, prefix) => {
    const date = DateTime.now().setZone('America/Mexico_City');
    let messageString = message.name + ' ' + message.message + ' ' + message.cause + '\n' + message.stack;
    messageString = securityText(messageString);
    if(!(message.cause || message.stack || message.name || message.message)) originalConsoleLog('[' + chalk.blue(prefix ? prefix : 'SYS') + '] : [' + chalk.red('ERROR') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', message);
    if(message.cause || message.stack || message.name || message.message) originalConsoleLog('[' + chalk.blue(prefix ? prefix : 'SYS') + '] : [' + chalk.red('ERROR') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', messageString);
    
    // discordLogger('error', messageString, prefix);
    if(!(message.cause || message.stack || message.name || message.message)) discordLogger('error', message as unknown as string, prefix);
    if(message.cause || message.stack || message.name || message.message) discordLogger('error', messageString, prefix);

}

const loggerWebhook = process.env.loggerlogWebhook ? new WebhookClient({ url: process.env.loggerlogWebhook }) : null;
const errorWebhook = process.env.loggerErrorWebhook ? new WebhookClient({ url: process.env.loggerErrorWebhook }) : null;

function discordLogger(type: string, message: string, prefix: string) {
    if(errors >= 30) type = 'critical';
    switch(type) {
        case 'log':
        case 'warn':
        case 'debug':
            const embed = new EmbedBuilder()
                .setColor(color(type))
                .setTitle(`Registro de tipo: ${type}`)
                .setDescription(typeof message === 'string' ? message : 'ErrorTextInput')
                .setTimestamp()
                .setFooter({ text: `💫 - By PancyStudios`, });

            loggerWebhook?.send({ embeds: [embed] }).catch(err => {
                const error = err as Error
                const date = DateTime.now().setZone('America/Mexico_City');
                originalConsoleLog('[' + chalk.blue(`${prefix ? prefix : 'SYS'} | LOGGER`) + '] : [' + chalk.red('CRITICAL') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', error.name ? error.name : 'Unkown error');    
                errors++;
            });
            break;
        case 'error':
            const errorEmbed = new EmbedBuilder()
                .setColor(color(type))
                .setTitle(`Registro de tipo: ${type}`)
                .setDescription(message)
                .setTimestamp()
                .setFooter({ text: `💫 - By PancyStudios`, });

            errorWebhook?.send({ embeds: [errorEmbed] }).catch(err => {
                const error = err as Error
                const date = DateTime.now().setZone('America/Mexico_City');
                originalConsoleLog('[' + chalk.blue(`${prefix ? prefix : 'SYS'} | LOGGER`) + '] : [' + chalk.red('CRITICAL') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', error.name ? error.name : 'Unkown error');    
                errors++;
            });
            break;
        case 'critical':
            const dateCritical = DateTime.now().setZone('America/Mexico_City');
            const criticalEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`Registro de tipo: ${type}`)
                .setDescription(message + '\n' + 'Por seguridad el sistema se detendra en 5 segundos, ya que se dectecto un gran autemto de errores')
                .setTimestamp()
                .setFooter({ text: `💫 - By PancyStudios`, });

            setTimeout(async() => {
                await errorWebhook?.send({ embeds: [criticalEmbed] }).catch(err => {
                    const error = err as Error
                    const date = DateTime.now().setZone('America/Mexico_City');
                    originalConsoleLog('[' + chalk.blue(`${prefix ? prefix : 'SYS'} | LOGGER`) + '] : [' + chalk.red('CRITICAL') + '] ' + chalk.bold(chalk.grey(`${date.hour}:${date.minute}:${date.second}`)) + ' : ', error.name ? error.name : 'Unkown error');
                });

                originalConsoleError('[' + chalk.blue(`${prefix ? prefix : 'SYS'} | LOGGER`) + '] : [' + chalk.red('CRITICAL') + '] ' + chalk.bold(chalk.grey(`${dateCritical.hour}:${dateCritical.minute}:${dateCritical.second}`)) + ' : ', "El sistema a detectado una gran cantidad de errores");
                originalConsoleError('[' + chalk.blue(`${prefix ? prefix : 'SYS'} | LOGGER`) + '] : [' + chalk.red('CRITICAL') + '] ' + chalk.bold(chalk.grey(`${dateCritical.hour}:${dateCritical.minute}:${dateCritical.second}`)) + ' : ', "Por seguridad el sistema se detendra en 5 segundos");

                setTimeout(() => {
                    originalConsoleError('[' + chalk.blue(`${prefix ? prefix : 'SYS'}`) + '] : [' + chalk.magenta('WARN') + '] ' + chalk.bold(chalk.grey(`${dateCritical.hour}:${dateCritical.minute}:${dateCritical.second}`)) + ' : ', "Proceso terminado de emergencia");
                    process.abort();
                }, 5000);

            }, 5000);
            break;
    }
}

function color(type: string) {
    switch(type) {
        case 'log':
        case 'info':
            return Colors.Green;
        case 'warn':
            return Colors.Yellow;
        case 'debug':
            return Colors.Aqua;
        case 'error':
            return Colors.Red;
    }
}

setInterval(() => {
    errors = 0;
}, 30000)