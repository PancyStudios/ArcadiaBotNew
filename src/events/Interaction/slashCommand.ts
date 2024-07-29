import { Event } from "../../structures/Event";
import { clientExtend as client } from "../..";
import { CommandInteractionOptionResolver } from "discord.js";
import { ExtendedInteraction } from "../../typings/SlashSubCommands";

export default new Event('interactionCreate', async(interaction) => { 
    if(interaction.isCommand()) {
        if(interaction.isChatInputCommand()) {
            const commandSubGroup = client.GroupSubCommandsName.get(interaction.commandName)
            const subcommand = client.subCommandsCategory.get(interaction.commandName)
            const commandGet = client.commands.get(interaction.commandName)

            if(commandSubGroup) {
                const group = interaction.options.getSubcommandGroup()
                const subCommandGroup = client.subCommandsCategory.get(group)
                if(!subCommandGroup) return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })
                const subcommand = interaction.options.getSubcommand()
                const command = client.commands.get(`${commandSubGroup}.${subCommandGroup}.${subcommand}`)
                if(!command) return interaction.reply({ content: 'El comando no existe, por favor, contacta con el desarollador.', ephemeral: true })   
                
                let userPermissions = command.userPermissions
                let botPermissions = command.botPermissions

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