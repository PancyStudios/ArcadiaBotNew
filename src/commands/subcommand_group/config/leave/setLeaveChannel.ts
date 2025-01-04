import { Command } from "../../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../..";
import { db } from "../../../..";
import { version } from '../../../../../package.json'

export default new Command({
    name: 'set_channel',
    description: 'Establece el canal de despediadas',
    options: [
        {
            name: 'channel',
            description: 'Canal de despedidas',
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channelTypes: [ChannelType.GuildText]
        }
    ],
    type: ApplicationCommandOptionType.Subcommand,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],

    run: async ({ interaction, client, args }) => {
        const channel = args.getChannel('channel', true, [ChannelType.GuildText]);
        const { guildId } = interaction;
        try {
            const guildDb = await db.guilds.findOne({ guildId });

            const NomPermsEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Permisos insuficientes')
            .setDescription('No tengo los permisos suficientes para enviar mensajes en el canal establecido')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio` })

            if(!channel.permissionsFor(interaction.guild.members.cache.get(client.user.id)).has('SendMessages')) return interaction.reply({ embeds: [NomPermsEmbed], ephemeral: true })
            
            guildDb.settings.leave.channel = channel.id;
            await guildDb.save();

            const SuccessEmbed = new EmbedBuilder()
            .setTitle('✅ | Canal de despedidas establecido')
            .setDescription(`El canal de despedidas ha sido establecido correctamente en <#${channel.id}>`)
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            interaction.reply({ embeds: [SuccessEmbed], ephemeral: true })                              
        } catch (err) {
            const ErrEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Un error inesperado ha ocurrido')
            .setDescription(`Algo ha salido mal al intentar guardar el canal\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})

            interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
            errorManager.reportError(err, 'src/subcommand_group/config/leave/setLeaveChannel.ts')
        }
    }
})