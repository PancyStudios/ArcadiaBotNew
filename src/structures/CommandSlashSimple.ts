import { CommandType } from "../typings/SlashCommand";


export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}
