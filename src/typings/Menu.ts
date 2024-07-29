import {
    StringSelectMenuInteraction,
    RoleSelectMenuInteraction,
    UserSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    ChannelSelectMenuInteraction,
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
    interaction: StringSelectMenuInteraction | RoleSelectMenuInteraction | UserSelectMenuInteraction | MentionableSelectMenuInteraction | ChannelSelectMenuInteraction;
    command: MenuType;
}

type RunFunction = (options: RunOptions) => void;

export type MenuType = {
    name: string;
    description: string;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    run: RunFunction;
};