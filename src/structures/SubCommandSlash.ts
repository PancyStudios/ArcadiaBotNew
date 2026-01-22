import { ApplicationCommandOptionType } from "discord.js";
import { CommandType } from "../typings/SlashSubCommands.js";

export class Command {
    constructor(commandOptions: CommandType) {
        commandOptions.type = ApplicationCommandOptionType.Subcommand; 
        Object.assign(this, commandOptions);
    }
}
