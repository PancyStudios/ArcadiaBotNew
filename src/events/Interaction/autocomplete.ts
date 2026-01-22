import { Event } from "../../structures/Event.js";
import { clientExtend as client } from "../../index.js";
import { CommandInteractionOptionResolver } from "discord.js";
import { ExtendedInteractionAuto } from "../../typings/SlashSubCommands.js";

export default new Event('interactionCreate', async(interaction) => { 
    if(interaction.isAutocomplete()) {
            const commandSubGroup = client.GroupSubCommandsName.get(interaction.commandName)
            const subcommand = client.subCommandsCategory.get(interaction.commandName)
            const commandGet = client.commands.get(interaction.commandName)

            if(commandSubGroup) {
                const group = interaction.options.getSubcommandGroup()
                const subCommandGroup = client.groupSubCommandsCategory.get(group)
                if(!subCommandGroup) return interaction.respond([])
                const subcommand = interaction.options.getSubcommand()
                const command = client.commands.get(`${commandSubGroup}.${subCommandGroup}.${subcommand}`)
                if(!command) return interaction.respond([])   
                
                let userPermissions = command.userPermissions
                let botPermissions = command.botPermissions

                command.auto({
                    client,
                    interaction: interaction as ExtendedInteractionAuto,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else if(subcommand) {
                const subcommandGet = interaction.options.getSubcommand()
                const command = client.commands.get(`${subcommand}.${subcommandGet}`)
                if(!command) return interaction.respond([])
                
                let userPermissions = command.userPermissions
                let botPermissions = command.botPermissions

                command.auto({
                    client,
                    interaction: interaction as ExtendedInteractionAuto,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else if(commandGet) {
                let userPermissions = commandGet.userPermissions
                let botPermissions = commandGet.botPermissions

                commandGet.auto({
                    client,
                    interaction: interaction as ExtendedInteractionAuto,
                    args: interaction.options as CommandInteractionOptionResolver,
                    userPermissions,
                    botPermissions
                })
            } else {
                return interaction.respond([])
            }
        }
})