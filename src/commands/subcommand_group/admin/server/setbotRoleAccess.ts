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
        const ownerId = (client.application?.owner as Team).ownerId
        if(interaction.user.id !== ownerId) return interaction.reply({ content: 'Unicamente el creador del bot puede editar este comando', ephemeral: true })
        const role = args.getRole('role')
        const { guilds } = db
        const guild = guilds.findOneAndUpdate({ guildId: interaction.guild.id },  { settings: { botRoleAccess: role.id } }, { upsert: true }).catch((err) => {
            interaction.reply({ content: 'No se ha podido establecer el rol', ephemeral: true })
            return
        })
        if(!guild) return;
        interaction.reply({ content: `Rol ${role.name} establecido como rol de acceso al bot`, ephemeral: true })
    }
})