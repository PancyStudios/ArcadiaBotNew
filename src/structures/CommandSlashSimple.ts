import { CommandType } from "../typings/SlashCommand.js";


export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}
