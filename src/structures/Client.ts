import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection,
    Partials,
    GatewayIntentBits,
    ApplicationCommandType,
    ApplicationCommandOptionData,
    ApplicationCommandData,
    ApplicationCommandOptionType,
} from "discord.js";
import path from 'path';
import glob from "glob";
import { Event } from './Event'; 
import { promisify } from "util";
import { ButtonType } from "../typings/Button";
import { CommandType } from "../typings/SlashCommand";
import { CommandType as CommandTypeSub } from "../typings/SlashSubCommands";
import { RegisterCommandsOptions } from "../typings/Client";
import { MenuType } from "../typings/Menu";
import { MinecraftConsole } from "../handlers/Console/Minecraft";

const globPromise = promisify(glob);

type CategoryCommandType = {
    name: string;
    type: ApplicationCommandType;
    description: string;
    options: ApplicationCommandOptionData[];
}

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType | CommandTypeSub> = new Collection();
    buttons: Collection<string, ButtonType> = new Collection();
    category: Collection<string, string> = new Collection();
    groupSubCommands: Collection<string, ApplicationCommandData> = new Collection();
    groupSubCommandsCategory: Collection<string, string> = new Collection();
    GroupSubCommandsName: Collection<string, string> = new Collection();
    subCommandsCategory: Collection<string, string> = new Collection();
    subCommands: Collection<string, ApplicationCommandData> = new Collection();
    categoryCommand: Collection<string, CategoryCommandType> = new Collection();
    menusString: Collection<string, MenuType> = new Collection();
    menuStringDynamic: Collection<string, MenuType> = new Collection();
    botAccessRoleIdCache: Array<string> = [];
    mcConsole: MinecraftConsole;

    constructor() {
        super({ 
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
            partials: [
                Partials.Channel,
                Partials.User,
                Partials.GuildMember
            ],
            rest: {
                retries: 4,
                globalRequestsPerSecond: 50,
            }
        });

    }
    

    async start() {
        await this.registerModules();
        await this.login(process.env.botToken);
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            const guild = this.guilds.cache.get(guildId);
            if(!guild) return console.log(`El servidor ${guildId} no fue encontrado`, 'API DC');
            guild.commands.set(commands);
            console.log(`Comandos registrados en el servidor ${guildId}`, 'API DC');
            // Sistema en desarrollo
            // setTimeout(async() => {
            //     try {
            //         const categorys = Array.from(this.category.values())
            //         categorys.forEach(async (category) => { 
            //             const guildNew = this.guilds.cache.get(guildId);
            //             guildNew.commands.cache.forEach(async (command) => { 
            //                 if(command.name !== category) return;
            //                 const localCommand = this.categoryCommand.get(category);
            //                 const options = command.options
            //                 const localOptions = localCommand.options
        
            //                 if(options !== localOptions) {
            //                         await command.edit({ options: localOptions });
            //                         console.log(`Comandos de la categoría ${category} editados`, 'API DC');      
            //                 };
            //             })
            //         })
            //     } catch (err) {
            //         console.error(`Error al editar los comandos de la categoría` + err, 'API DC');
            //     } 
            // }, 5000)
        } else {
            this.application?.commands.set(commands);
            console.log(`Comandos registrados de manera global`, 'API DC');
            // setTimeout(async() => {
            //     try {
            //         const categorys = Array.from(this.category.values())
            //         categorys.forEach(async (category) => { 
            //             this.application.commands.cache.forEach(async (command) => { 
            //                 if(command.name !== category) return;
            //                 const localCommand = this.categoryCommand.get(category);
            //                 const options = command.options
            //                 const localOptions = localCommand.options
        
            //                 if(options !== localOptions) {
            //                         await command.edit({ options: localOptions });
            //                         console.log(`Comandos de la categoría ${category} editados`, 'API DC');      
            //                 };
            //             })
            //         })
            //     } catch (err) {
            //         console.error(`Error al editar los comandos de la categoría` + err, 'API DC');
            //     } 
            // }, 5000)
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        
        const commandCategories = await globPromise(
            `${process.cwd()}/src/commands/principal/*`
        );

        //Comandos sin subcommands
        for (const categoryPath of commandCategories) {
            // Obtener los archivos de subcomandos dentro de la categoría
            const commandFiles = await globPromise(
                `${categoryPath}/*{.js,.ts}`
            );

            for (const filePath of commandFiles) {
                const command: CommandType = await this.importFile(filePath);
                if (!command?.name) continue;
    
                this.commands.set(command.name, command)
                slashCommands.push(command);
            }
        }
        //SubCommands
        const commandSubCategories = await globPromise(
            `${process.cwd()}/src/commands/subcommands/*`
        );

        for (const categoryPath of commandSubCategories) {
            // Obtener los archivos de subcomandos dentro de la categoría
            const categoryName = path.basename(categoryPath);
            const commandFiles = await globPromise(
                `${categoryPath}/*{.js,.ts}`
            );

            this.subCommandsCategory.set(categoryName, categoryName)
            
            let categoryCommand = {
                name: categoryName,
                type: 1,
                description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                options: [],
            };

            for (const filePath of commandFiles) {
                const command: CommandTypeSub = await this.importFile(filePath);
                if (!command?.name) continue
                categoryCommand.options.push(command)
                this.commands.set(`${categoryName}.${command.name}`, command)
            }

            this.subCommands.set(categoryName, categoryCommand)
            slashCommands.push(categoryCommand);
        }

        //Group Subcommands
        const commandGroupSubCategories = await globPromise(
            `${process.cwd()}/src/commands/subcommand_group/*`
        );

        for (const subGroupcommandsPath of commandGroupSubCategories) {
            // Obtener los archivos de subcomandos dentro de la categoría
            const categoryGroup = path.basename(subGroupcommandsPath);
            const subGroupCommands = await globPromise(
                `${subGroupcommandsPath}/*`
            );

            this.GroupSubCommandsName.set(categoryGroup, categoryGroup)

            let categoryGroupCommand = {
                name: categoryGroup,
                type: 1,
                description: `${categoryGroup} commands (Si ves esta descripcion, no ejecutar el comando)`,
                options: [],
            };

            for (const categoryPath of subGroupCommands) {
                // Obtener los archivos de subcomandos dentro de la categoría
                const categoryName = path.basename(categoryPath);
                const commandFiles = await globPromise(
                    `${categoryPath}/*`
                );

                let subCommand = {
                    name: categoryName,
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    description: `${categoryName} commands (Si ves esta descripcion, no ejecutar el comando)`,
                    options: [],
                };
    
                this.groupSubCommandsCategory.set(categoryName, categoryName)
    
                for (const filePath of commandFiles) {
                    const command: CommandTypeSub = await this.importFile(filePath);
                    if (!command?.name) continue
                    subCommand.options.push(command)
                    this.commands.set(`${categoryGroup}.${categoryName}.${command.name}`, command)
                }

                categoryGroupCommand.options.push(subCommand)
            }
            this.groupSubCommands.set(categoryGroup, categoryGroupCommand)
            slashCommands.push(categoryGroupCommand);
        }



        const buttonFiles = await globPromise(
            `${process.cwd()}/src/buttons/*/*{.js,.ts}`
        );
       
        buttonFiles.forEach(async (filePath) => {
            const command: ButtonType = await this.importFile(filePath);
            if (!command?.name) return;

            this.buttons.set(command.name, command);
        });

        const menuFilesString = await globPromise(
            `${process.cwd()}/src/context/string/*`
        );

        for (const categoryPath of menuFilesString) {
            const categoryName = path.basename(categoryPath);
            // Obtener los archivos de las opciones dentro del menu
            const commandFiles = await globPromise(
                `${categoryPath}/*{.js,.ts}`
            );

            for (const filePath of commandFiles) {
                const command: MenuType = await this.importFile(filePath);
                if (!command.name) continue;
                if (command.name.length > 32) {
                    console.warn(`El nombre del comando ${command.name} es mayor a 32 caracteres`, 'API DC');
                    continue;
                }
                this.menusString.set(`${categoryName}.${command.name}`, command);
            }
        }

        const menuFilesStringDynamic = await globPromise(
            `${process.cwd()}/src/context/string_dynamic/*`
        );

        for (const categoryPath of menuFilesStringDynamic) {
            // Obtener los archivos del menu
            const commandFiles = await globPromise(
                `${categoryPath}/*{.js,.ts}`
            );

            for (const filePath of commandFiles) {
                const command: MenuType = await this.importFile(filePath);
                if (!command.name) continue;
                this.menuStringDynamic.set(command.name, command);
            }
        }   

        this.on("clientReady", (_) => {
            this.registerCommands({
                commands: slashCommands,
            });

            console.debug(`Comandos en total: ${slashCommands.length}`);
            console.warn(`Comandos necesiarios para el limite: ${100 - slashCommands.length}`);

            this.mcConsole = new MinecraftConsole({
                channelId: process.env.channelConsole,
                apiKey: process.env.arcadiaPanelKey,
                panelUrl: process.env.arcadiaPanelUrl,
                serverUuid: 'b44bb677',
                discordClient: this
            });
        });

        const eventFiles = await globPromise(
            `${process.cwd()}/src/events/*/*{.js,.ts}`
        );
        eventFiles.forEach(async (filePath) => {
            
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            if(!event?.event) return;
            this.on(event.event, event.run);
        });
    }

    setBotAccessRoleIdCache(roleId: string) {
        return this.botAccessRoleIdCache.push(roleId);
    }

    removeBotAccessRoleIdCache(roleId: string) {
        return this.botAccessRoleIdCache = this.botAccessRoleIdCache.filter((id) => id !== roleId);
    }

    getBotAccessRoleIdCache() {
        return this.botAccessRoleIdCache;
    }
}