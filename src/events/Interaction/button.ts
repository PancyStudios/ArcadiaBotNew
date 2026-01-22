import { clientExtend as client} from "../../index.js";
import { Event } from "../../structures/Event.js"
import { EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import { db } from "../../index.js";

export default new Event('interactionCreate', (interaction) => {
    if(!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);
    const ComingSoonEmbed = new EmbedBuilder()
    .setTitle('🚧 | Proximamente')
    .setDescription('Nos encontramos trabajando en esta función, por favor se paciente y intente en cuanto el administrador del bot lo informe.')
    .setColor('Orange')
    .setFooter({ text: '💫 - Developed by PancyStudios' })
    .setTimestamp()

    if(!button) return interaction.reply({ embeds: [ComingSoonEmbed], ephemeral: true });

    const { guilds } = db;

    // const userPermissions = button?.userPermissions;
    // const botPermissions = button?.botPermissions;

    // const AdminRolesId = guilds.get(x => x.id === interaction.guildId)?.settings.roles_whitelist.administration
    // const RolesAdmin = interaction.guild?.roles.cache.filter(x => AdminRolesId?.some(y => y === x.id))

    // const AdminPermission = (interaction.member.roles as GuildMemberRoleManager).cache.some(role => RolesAdmin?.has(role.id))

    // if(!(interaction.guild.members.cache.get(interaction.user.id).permissions.has(userPermissions || []) || AdminPermission)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof userPermissions === 'string' ? userPermissions : userPermissions.join(', ')}\``, ephemeral: true })
    // if(!interaction.guild.members.cache.get(client.user.id).permissions.has(botPermissions || [])) return interaction.reply({ content: `No tengo permisos para ejecutar este comando.\n Uno de estos permisos puede faltar: \`${typeof botPermissions === 'string' ? botPermissions : botPermissions.join(', ')}\``, ephemeral: true })

    button.run({
        interaction,
        client,
        command: button
    })
})