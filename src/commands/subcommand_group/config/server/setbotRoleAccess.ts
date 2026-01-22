import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, Team } from "discord.js";
import { db } from "../../../..";

export default new Command({
    name: 'setrole_botaccess',
    description: 'Establece el rol inmune al bot / con permisos de administrador',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'role',
            description: 'Rol a establecer',
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],

    run: async ({ interaction, args, client }) => {
        const ownerId = '711329342193664012'
        if(interaction.user.id !== ownerId) return interaction.reply({ content: 'Unicamente el creador del bot puede editar este comando', flags: ['Ephemeral'] })
        const role = args.getRole('role')
        const { guilds } = db
        const guild =await guilds.findOne({ guildId: interaction.guild.id }).catch((err) => {
            interaction.reply({ content: 'No se ha podido establecer el rol', flags: ['Ephemeral'] })
            return
        })
        if(!guild) return;
        guild.settings.botAccess = role.id
        await guild.save().catch((err) => {
            interaction.reply({ content: 'No se ha podido establecer el rol', flags: ['Ephemeral'] })
            return
        })
        interaction.reply({ content: `Rol ${role.name} establecido como rol de acceso al bot`, flags: ['Ephemeral'] })
        client.setBotAccessRoleIdCache(role.id)
        client.getBotAccessRoleIdCache()
    }
})