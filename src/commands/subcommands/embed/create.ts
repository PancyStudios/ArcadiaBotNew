import { Command } from "../../../structures/SubCommandSlash";
import { 
    ApplicationCommandOptionType, 
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    resolveColor,
    TextInputStyle
} from "discord.js";
import { db } from "../../..";

export default new Command({
    name: 'create',
    description: 'Crea un nuevo embed',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'name',
            description: 'Nombre del embed',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'color',
            description: 'Color del embed',
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true
        },
        {
            name: 'thumbnail_url',
            description: 'URL de la miniatura del embed',
            type: ApplicationCommandOptionType.String,
            required: false
        }, 
        {
            name: 'author_icon_url',
            description: 'URL del icono del autor',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'footer_icon_url',
            description: 'URL del icono del footer',
            type: ApplicationCommandOptionType.String,
            required: false
        },
    ],
    auto: async({ interaction, args}) => {
        const focus = args.getFocused(true)
        if(focus.name !== 'color') return;

    },
    run: async({ interaction, args }) => { 
        const { embeds } = db
        const name = args.getString('name')
        const IsExist = await embeds.findOne({ GuildId: interaction.guildId, name: name })
        if(IsExist) return interaction.reply({ content: `Ya existe un embed con el nombre ${name}`, ephemeral: true })

        const ModalCreate = new ModalBuilder()
        .setTitle('Crear embed')
        .setCustomId(`create_embed_${interaction.user.id}`)

        const TitleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Titulo del embed')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)

        const DescriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Descripcion del embed')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(4096)

        const AuthorInput = new TextInputBuilder()
        .setCustomId('author')
        .setLabel('Autor del embed')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)

        const FooterInput = new TextInputBuilder()
        .setCustomId('footer')
        .setLabel('Footer del embed')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)

        const ImageUrl = new TextInputBuilder()
        .setCustomId('image_url')
        .setLabel('URL de la imagen del embed')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)

        const TitleRow = new ActionRowBuilder<TextInputBuilder>()
        .setComponents(TitleInput)

        const DescriptionRow = new ActionRowBuilder<TextInputBuilder>()
        .setComponents(DescriptionInput)

        const AuthorRow = new ActionRowBuilder<TextInputBuilder>()
        .setComponents(AuthorInput)

        const FooterRow = new ActionRowBuilder<TextInputBuilder>()
        .setComponents(FooterInput)

        const ImageRow = new ActionRowBuilder<TextInputBuilder>()
        .setComponents(ImageUrl)

        ModalCreate.setComponents([TitleRow, DescriptionRow, AuthorRow, FooterRow, ImageRow])

        await interaction.showModal(ModalCreate)

        const Modal = await interaction.awaitModalSubmit({ time: 120_000, filter: (i) => i.customId === `create_embed_${interaction.user.id}` }).catch(() => {
            interaction.editReply({ content: 'Tiempo de espera agotado', components: [] })
        })

        const embed = new EmbedBuilder()
    }
})