import { Event } from "../../structures/Event";
import { clientExtend as client, errorManager } from "../..";
import { CommandInteractionOptionResolver, EmbedBuilder, GuildMember } from "discord.js";
import { ExtendedInteraction } from "../../typings/SlashSubCommands";

export default new Event('interactionCreate', async(interaction) => { 
    if(interaction.isCommand()) {
        const ComingSoonEmbed = new EmbedBuilder()
        .setTitle('🚧 | Proximamente')
        .setDescription(`Nos encontramos trabajando en este comando, por favor se paciente y intente en cuanto el administrador del bot lo informe.
            
            Este comando actualmente solo puede ser usado por quienes tengan el rol definido de  \`BotAccess\``)
        .setColor('Orange')
        .setFooter({ text: '💫 - Developed by PancyStudios' })
        .setTimestamp()
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

                if(!((interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if(!((interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })

                if(command.isBeta && !roleAccess) return interaction.reply({ embeds: [ComingSoonEmbed], ephemeral: true })
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

                if(!((interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if(!((interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })
                
                if(command.isBeta && !roleAccess) return interaction.reply({ embeds: [ComingSoonEmbed], ephemeral: true })
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

                if(!((interaction.member as GuildMember).permissions.has(userPermissions || []) || roleAccess)) return interaction.reply({ content: `No tienes permisos para ejecutar este comando, puede que te falte alguno de los siguientes: \`${userPermissions.join(', ')}\``, ephemeral: true })
                if(!((interaction.guild.members.cache.get(client.user.id) as GuildMember).permissions.has(botPermissions || []) || roleAccess)) return interaction.reply({ content: `No tengo permisos para ejecutar este comando, puede que me falte alguno de los siguientes: \`${botPermissions.join(', ')}\``, ephemeral: true })

                if(commandGet.isBeta && !roleAccess) return interaction.reply({ embeds: [ComingSoonEmbed], ephemeral: true })
                commandGet.run({
                    client,
                    interaction: interaction as ExtendedInteraction,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else {
                const NotFoundEmbed = new EmbedBuilder()
                .setTitle('❌ | Comando no encontrado')
                .setDescription(`Este comando no existe, deberia de no aparecerte por lo que se emitira un aviso automatico al desarollador para que arregle este problema
                    
                Si el problema persiste, contacta con el desarollador`)
                .setColor('Red')
                .setFooter({ text: '💫 - Developed by PancyStudios' })
                .setTimestamp()
                interaction.reply({ embeds: [NotFoundEmbed], ephemeral: true })

                errorManager.reportError(`El comando ${interaction.commandName} no existe, aun asi aparece en el servidor ${interaction.guildId}`, 'SlashCommand.ts')
            }
        }
    }
})