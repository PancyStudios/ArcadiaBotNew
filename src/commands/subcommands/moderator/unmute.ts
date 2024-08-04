import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";

export default new Command({
    name: 'unmute',
    description: 'Desmutear a un usuario',
    type: 1,
    options: [
        {
            name: 'usuario',
            description: 'Usuario a desmutear',
            type: ApplicationCommandOptionType.User
        }
    ],
    userPermissions: ['MuteMembers'],

    run: async({ interaction, args }) => {
        const { guild } = interaction
        const member = args.getMember('usuario') as GuildMember
        member.timeout(null, `Desmuteado por ${interaction.user.tag}`)
        
        interaction.reply({ content: 'Usuario desmuteado', ephemeral: true })
    }
})