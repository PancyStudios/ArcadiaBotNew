import { Event } from "../../structures/Event";
import { clientExtend as client } from "../..";
import { CommandInteractionOptionResolver, GuildMember } from "discord.js";
import { ExtendedInteraction } from "../../typings/SlashSubCommands";

export default new Event('interactionCreate', async(interaction) => { 
    if(interaction.isCommand()) {
        if(interaction.isChatInputCommand()) {
            const commandSubGroup = client.GroupSubCommandsName.get(interaction.commandName)
            const subcommand = client.subCommandsCategory.get(interaction.commandName)
            const commandGet = client.commands.get(interaction.commandName)

            if(commandSubGroup) {
                const group = interaction.options.getSubcommandGroup()
                const subCommandGroup = client.groupSubCommandsCategory.get(group)
                if(!subCommandGroup) return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })
                const subcommand = interaction.options.getSubcommand()
                const command = client.commands.get(`${commandSubGroup}.${subCommandGroup}.${subcommand}`)
                if(!command) return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })   
                
                let userPermissions = command.userPermissions
                let botPermissions = command.botPermissions
                
                const rolesId = client.getBotAccessRoleIdCache()

                const roleAccess = (interaction.member as GuildMember).roles.cache.hasAny(...rolesId)

                if((!(interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if((!(interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })

                command.run({
                    client,
                    interaction: interaction as ExtendedInteraction,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else if(subcommand) {
                const subcommandGet = interaction.options.getSubcommand()
                const command = client.commands.get(`${subcommand}.${subcommandGet}`)
                if(!command) return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })
                
                let userPermissions = command.userPermissions
                let botPermissions = command.botPermissions
                
                const rolesId = client.getBotAccessRoleIdCache()

                const roleAccess = (interaction.member as GuildMember).roles.cache.hasAny(...rolesId)

                if((!(interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if((!(interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })

                command.run({
                    client,
                    interaction: interaction as ExtendedInteraction,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else if(commandGet) {
                let userPermissions = commandGet.userPermissions
                let botPermissions = commandGet.botPermissions
                
                const rolesId = client.getBotAccessRoleIdCache()

                const roleAccess = (interaction.member as GuildMember).roles.cache.hasAny(...rolesId)

                if((!(interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if((!(interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })

                commandGet.run({
                    client,
                    interaction: interaction as ExtendedInteraction,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else {
                return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })
            }
        }
    }
})