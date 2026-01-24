import { Command } from "../../../structures/SubCommandSlash";
import {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    resolveColor,
    TextInputStyle,
    ColorResolvable, LabelBuilder
} from "discord.js";
import { db } from "../../..";
import { textChange, isUrl } from "../../../utils/func";
import hexColorRegex from "hex-color-regex";

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
    userPermissions: ['ManageMessages'],

    auto: async({ interaction, args}) => {
        const focus = args.getFocused(true)
        if(focus.name !== 'color') return;
        const isHex = hexColorRegex({ strict: true }).test(focus.value)

        let choices = [
            { name: "Negro", value: "Default" },
            { name: "Blanco", value: "White" },
            { name: "Aqua", value: "Aqua" },
            { name: "Verde", value: "Green" },
            { name: "Azul", value: "Blue" },
            { name: "Amarillo", value: "Yellow" },
            { name: "Púrpura", value: "Purple" },
            { name: "Rosa Vivo Luminoso", value: "LuminousVividPink" },
            { name: "Fucsia", value: "Fuchsia" },
            { name: "Oro", value: "Gold" },
            { name: "Naranja", value: "Orange" },
            { name: "Rojo", value: "Red" },
            { name: "Gris", value: "Grey" },
            { name: "Marino", value: "Navy" },
            { name: "Aqua Oscuro", value: "DarkAqua" },
            { name: "Verde Oscuro", value: "DarkGreen" },
            { name: "Azul Oscuro", value: "DarkBlue" },
            { name: "Púrpura Oscuro", value: "DarkPurple" },
            { name: "Rosa Vivo Oscuro", value: "DarkVividPink" },
            { name: "Oro Oscuro", value: "DarkGold" },
            { name: "Naranja Oscuro", value: "DarkOrange" },
            { name: "Rojo Oscuro", value: "DarkRed" },
            { name: "Gris Oscuro", value: "DarkGrey" },
            { name: "Gris Más Oscuro", value: "DarkerGrey" },
            { name: "Gris Claro", value: "LightGrey" },
            { name: "Marino Oscuro", value: "DarkNavy" },
            { name: "Azul Borroso", value: "Blurple" },
            { name: "Gris Borroso", value: "Greyple" },
            { name: "Oscuro Pero No Negro", value: "DarkButNotBlack" },
            { name: "No Tan Negro", value: "NotQuiteBlack" }
        ]
        
        if(isHex) choices.push({
            name: focus.value,
            value: focus.value
        })
        
        const filter = choices.filter(x => x.name.includes(focus.value)).slice(0, 25);
        interaction.respond(filter.map(x => ({ name: x.name, value: x.value})))
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
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setRequired(false)

        const DescriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)

        const AuthorInput = new TextInputBuilder()
        .setCustomId('author')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setRequired(false)

        const FooterInput = new TextInputBuilder()
        .setCustomId('footer')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setRequired(false)

        const ImageUrl = new TextInputBuilder()
        .setCustomId('image_url')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(256)
        .setRequired(false)

        const TitleLabel = new LabelBuilder()
        .setLabel('Título')
        .setTextInputComponent(TitleInput)

        const DescriptionLabel = new LabelBuilder()
        .setLabel('Descripción')
        .setTextInputComponent(DescriptionInput)

        const AuthorLabel = new LabelBuilder()
        .setLabel('Autor')
        .setTextInputComponent(AuthorInput)

        const FooterLabel = new LabelBuilder()
        .setLabel('Footer')
        .setTextInputComponent(FooterInput)

        const ImageLabel = new LabelBuilder()
        .setLabel('URL de la imagen')
        .setTextInputComponent(ImageUrl)


        ModalCreate.addLabelComponents([TitleLabel, DescriptionLabel, AuthorLabel, FooterLabel, ImageLabel])

        await interaction.showModal(ModalCreate)

        const Modal = await interaction.awaitModalSubmit({ time: 120_000, filter: (i) => i.customId === `create_embed_${interaction.user.id}` }).catch(() => {
            interaction.editReply({ content: 'Tiempo de espera agotado / No se recibio una respuesta', components: [] })
        })
        if(!Modal) return

        let title = Modal.fields.getTextInputValue('title')
        if(title === "") title = null
        const description = Modal.fields.getTextInputValue('description')
        let author = Modal.fields.getTextInputValue('author')
        if(author === "") author = null
        let footer = Modal.fields.getTextInputValue('footer')
        if(footer === "") footer = null
        let image_url = Modal.fields.getTextInputValue('image_url')
        if(image_url === "") image_url = null

        const thumbnail_url = args.getString('thumbnail_url', false)
        const author_icon_url = args.getString('author_icon_url', false)
        const footer_icon_url = args.getString('footer_icon_url', false)

        const colorInput = args.getString('color', false) as ColorResolvable
        let color:number 
        if(colorInput) color = resolveColor(colorInput)
        if(!colorInput) color = null

        const embedCreate = new EmbedBuilder({
            title: textChange(title, interaction.member, interaction.guild),
            description: textChange(description, interaction.member, interaction.guild),
            color: color,
            thumbnail: isUrl(thumbnail_url, interaction.member, interaction.guild) ? { url: textChange(thumbnail_url, interaction.member, interaction.guild) } : { url: null},
            image: isUrl(image_url, interaction.member, interaction.guild) ? { url: textChange(image_url, interaction.member, interaction.guild) } : { url: null},
            footer: { text: textChange(footer, interaction.member, interaction.guild), icon_url: isUrl(footer_icon_url, interaction.member, interaction.guild) ? textChange(footer_icon_url, interaction.member, interaction.guild) :  null, },
            author: { name: textChange(author, interaction.member, interaction.guild), icon_url: isUrl(author_icon_url, interaction.member, interaction.guild) ? textChange(author_icon_url, interaction.member, interaction.guild) : null, },
            fields: []
        })

        const newEmbed = new embeds({
            name: name,
            guildId: interaction.guildId,
            embed: {
                title: title,
                description: description,
                color: color,
                thumbnail: { url: thumbnail_url },
                image: { url: image_url },
                footer: { text: footer, icon_url: footer_icon_url },
                author: { name: author, icon_url: author_icon_url },
            }
        })
        newEmbed.save()
        Modal.reply({ content: `Embed ${name} creado\n\nEsta es la vista previa del embed`, embeds: [embedCreate] })
    }
})