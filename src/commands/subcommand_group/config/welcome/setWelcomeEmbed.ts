import { Command } from "../../../../structures/SubCommandSlash.js";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { errorManager } from "../../../../index.js";
import { db } from "../../../../index.js";
import { version } from '../../../../../package.json' with { type: "json" }

export default new Command({
    name: 'set_embed',
    description: 'Establece el embed de bienvenidas',
    options: [
        {
            name: 'embed',
            description: 'Embed de bienvenidas',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    type: ApplicationCommandOptionType.Subcommand,
    userPermissions: ['ManageGuild'],
    botPermissions: ['SendMessages', 'EmbedLinks'],

    auto: async ({ interaction, args }) => {
        const focus = args.getFocused(true)
        if(focus.name !== 'embed') return;
        const { guildId } = interaction
        const { embeds } = db
        const embedDb = await embeds.find({ guildId: guildId })

        const choices = embedDb.map(embed => { 
            return embed.name
        })
        const filter = choices.filter(embed => embed.startsWith(focus.value)).slice(0, 24)
        const filterArray = filter.map(embed => {
            return {
                name: embed,
                value: embed
            }
        })
        filterArray.push({ 
            value: 'Nunguno',
            name: 'null'
        })
        interaction.respond(filterArray)
    },
    run: async ({ interaction, client, args }) => {
        const embed = args.getString('embed');
        const { guildId } = interaction;
        const { guilds } = db;
        const guildDb = await guilds.findOne({ guildId });
        if(embed === 'null') {
            const NotEmbed = new EmbedBuilder()
            .setTitle('⚠️ | Embed no establecido')
            .setDescription('El embed de bienvenidas no esta establecido')
            .setColor('Red')
            .setTimestamp()
            .setFooter({ text: `💫 - Developed by PancyStudio` })

            if(guildDb.settings.welcome.embed === '') return interaction.reply({ embeds:[NotEmbed], ephemeral: true })
            try {
                guildDb.settings.welcome.embed = '';
                await guildDb.save();
                const SuccessEmbed = new EmbedBuilder()
                .setTitle('✅ | Embed de bienvenidas eliminado')
                .setDescription('El embed de bienvenidas ha sido eliminado correctamente')
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})
                interaction.reply({ embeds: [SuccessEmbed], ephemeral: true })
            } catch (err) {
                const ErrEmbed = new EmbedBuilder()
                .setTitle('⚠️ | Un error inesperado ha ocurrido')
                .setDescription(`Algo ha salido mal al intentar guardar el embed\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})
                interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
                errorManager.reportError(err, 'src/commands/subcommand_group/config/welcome/setWelcomeEmbed.ts')
            }
        } else {
            try {
                const embedDb = await db.embeds.findOne({ guildId: guildId, name: embed })
                if(!embedDb) {
                    const NotEmbed = new EmbedBuilder()
                    .setTitle('⚠️ | Embed no encontrado')
                    .setDescription('El embed de bienvenidas no ha sido encontrado')
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: `💫 - Developed by PancyStudio` })
                    return interaction.reply({ embeds: [NotEmbed], ephemeral: true })
                }
                guildDb.settings.welcome.embed = embedDb.name;
                await guildDb.save();
                const SuccessEmbed = new EmbedBuilder()
                .setTitle('✅ | Embed de bienvenidas establecido')
                .setDescription(`El embed de bienvenidas ha sido establecido correctamente en \`${embed}\``)
                .setColor('Green')
                .setTimestamp()
                .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})
                interaction.reply({ embeds: [SuccessEmbed], ephemeral: true })
            } catch (err) {
                const ErrEmbed = new EmbedBuilder()
                .setTitle('⚠️ | Un error inesperado ha ocurrido')
                .setDescription(`Algo ha salido mal al intentar guardar el embed\n\nError: \`${err}\`\n\n\`\`\`⚒️ El error a sido reportado automaticamente, intente de nuevo más tarde\`\`\``)
                .setColor('Red')
                .setTimestamp()
                .setFooter({ text: `💫 - Developed by PancyStudio | Arcas Bot v${version}`})
                interaction.reply({ embeds: [ErrEmbed], ephemeral: true })
                errorManager.reportError(err, 'src/commands/subcommand_group/config/welcome/setWelcomeEmbed.ts')
            }
        }
    }
})