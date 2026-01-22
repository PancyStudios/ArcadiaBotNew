import {
    GuildMember,
    CommandInteraction,
    PermissionResolvable,
    AutocompleteInteraction,
    CommandInteractionOptionResolver,
    ApplicationCommandData,
} from 'discord.js';
import { ExtendedClient } from '../structures/Client.js';

/**
 * {
 *  name: 'commandname',
 * description: 'any description',
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

export interface ExtendedInteractionAuto extends AutocompleteInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
    
}

interface AutocompleteOptions {
    client: ExtendedClient;
    interaction: ExtendedInteractionAuto;
    args: CommandInteractionOptionResolver;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
}

type RunFunction = (options: RunOptions) => any;
type AutocompleteFunction = (options: AutocompleteOptions) => any;

export type CommandType = {
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    isBeta?: boolean;
    run: RunFunction;
    auto?: AutocompleteFunction;
} & ApplicationCommandData;