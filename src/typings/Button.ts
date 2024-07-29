import {
    ButtonInteraction,
    PermissionResolvable
} from 'discord.js';
import { ExtendedClient } from '../structures/Client';

/**
 * {
 *  name: 'commandname',
 * description: 'any description',
 * run: async({ interaction }) => {
 *
 * }
 * }
 */
interface RunOptions {
    client: ExtendedClient;
    interaction: ButtonInteraction;
    command: ButtonType;
}

type RunFunction = (options: RunOptions) => any;

export type ButtonType = {
    name: string;
    description: string;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    run: RunFunction;
};