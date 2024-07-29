import { ApplicationCommandOptionType } from "discord.js";
import { CommandType } from "../typings/SlashSubCommands";

export class Command {
    constructor(commandOptions: CommandType) {
        commandOptions.type = ApplicationCommandOptionType.Subcommand; 
        Object.assign(this, commandOptions);
    }
}
