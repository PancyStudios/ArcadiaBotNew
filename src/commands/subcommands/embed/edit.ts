import { Command } from '../../../structures/SubCommandSlash';
import { db } from '../../..';
import {
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ColorResolvable,
    resolveColor,
    EmbedBuilder,
    LabelBuilder
} from 'discord.js';
import { isUrl, textChange } from '../../../utils/func';
import hexColorRegex from 'hex-color-regex';

export default new Command({
    name: 'edit',
    description: 'Edita un embed',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'embed',
            description: 'Nombre del embed',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: 'form',
            description: 'Titulo, Author, Footer, Description, Image',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Editar',
                    value: 'edit'
                }
            ]
        },
        {
            name: 'color',
            description: 'Color del embed',
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true
        },
        {
            name: 'footer_icon_url',
            description: 'URL del icono del footer',
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
            name: 'thumbnail_url',
            description: 'URL de la miniatura',
            type: ApplicationCommandOptionType.String,
            required: false
        },
    ],

    auto: async ({ interaction, args }) => {
        const focus = args.getFocused(true)
        if (focus.name === 'color') {
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

            if (isHex) choices.push({
                name: focus.value,
                value: focus.value
            })

            const filter = choices.filter(x => x.name.includes(focus.value)).slice(0, 25);
            interaction.respond(filter.map(x => ({ name: x.name, value: x.value })))
        } else if (focus.name === 'embed') {
            const { guildId } = interaction
            const { embeds } = db
            const embedDb = await embeds.find({ guildId: guildId })

            const choices = embedDb.map(embed => {
                return embed.name
            })
            const filter = choices.filter(embed => embed.startsWith(focus.value)).slice(0, 25)
            const filterArray = filter.map(embed => {
                return {
                    name: embed,
                    value: embed
                }
            })
            interaction.respond(filterArray)
        }
    },
    run: async ({ interaction, args }) => {
        const embed = args.getString('embed')
        const form = args.getString('form')
        const color = args.getString('color') as ColorResolvable;
        const footer_icon_url = args.getString('footer_icon_url')
        const author_icon_url = args.getString('author_icon_url')
        const thumbnail_url = args.getString('thumbnail_url')

        let colorResolve: number
        colorResolve = resolveColor(color)
        if (!colorResolve) return interaction.reply({ content: 'Color invalido', ephemeral: true })

        const { member, guild } = interaction
        const { embeds } = db

        const embedDb = await embeds.findOne({ guildId: guild.id, name: embed })
        if (!embedDb) return interaction.reply({ content: 'No se ha encontrado el embed', ephemeral: true })

        if (colorResolve) embedDb.embed.color = colorResolve
        if (footer_icon_url && isUrl(footer_icon_url, member, guild)) embedDb.embed.footer.icon_url = footer_icon_url
        if (author_icon_url && isUrl(author_icon_url, member, guild)) embedDb.embed.author.icon_url = author_icon_url
        if (thumbnail_url && isUrl(thumbnail_url, member, guild)) embedDb.embed.thumbnail.url = thumbnail_url

        if (form === 'edit') {
            const ModalEdit = new ModalBuilder()
                .setTitle('Editar Embed')
                .setCustomId('edit_embed' + interaction.id)

            const TitleInput = new TextInputBuilder()
                .setCustomId('title')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(256)
                .setRequired(false)
                .setValue(embedDb.embed.title ?? null)

            const DescriptionInput = new TextInputBuilder()
                .setCustomId('description')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(embedDb.embed.description ?? null)

            const AuthorInput = new TextInputBuilder()
                .setCustomId('author')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(256)
                .setRequired(false)
                .setValue(embedDb.embed.author.name ?? null)

            const FooterInput = new TextInputBuilder()
                .setCustomId('footer')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(256)
                .setRequired(false)
                .setValue(embedDb.embed.footer.text ?? null)

            const ImageUrl = new TextInputBuilder()
                .setCustomId('image_url')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(256)
                .setRequired(false)
                .setValue(embedDb.embed.image.url ?? null)


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

            ModalEdit.addLabelComponents([TitleLabel, DescriptionLabel, AuthorLabel, FooterLabel, ImageLabel])

            await interaction.showModal(ModalEdit)

            const Modal = await interaction.awaitModalSubmit({ time: 120_000, filter: (i) => i.customId === `create_embed_${interaction.user.id}` }).catch(() => {
                interaction.editReply({ content: 'Tiempo de espera agotado / No se recibio una respuesta', components: [] })
            })
            if (!Modal) return

            let title = Modal.fields.getTextInputValue('title')
            if(title === "") title = null
            const description = Modal.fields.getTextInputValue('description')
            let author = Modal.fields.getTextInputValue('author')
            if(author === "") author = null
            let footer = Modal.fields.getTextInputValue('footer')
            if(footer === "") footer = null
            let image_url = Modal.fields.getTextInputValue('image_url')
            if(image_url === "") image_url = null

            if (title) embedDb.embed.title = title
            if (description) embedDb.embed.description = description
            if (author) embedDb.embed.author.name = author
            if (footer) embedDb.embed.footer.text = footer
            if (image_url && isUrl(image_url, member, guild)) embedDb.embed.image.url = image_url
        }

        await embedDb.save().catch((err) => {
            interaction.reply({ content: 'Error al guardar el embed\nDetalles en consola', ephemeral: true })
            console.error(err)
        })

        await interaction.reply({ content: 'Embed editado correctamente', ephemeral: true })
        const embedEdit = new EmbedBuilder({
            color: embedDb.embed.color,
            title: textChange(embedDb.embed.title, member, guild),
            description: textChange(embedDb.embed.description, member, guild),
            footer: {
                text: textChange(embedDb.embed.footer.text, member, guild),
                iconURL: isUrl(embedDb.embed.footer.icon_url, member, guild) ? textChange(embedDb.embed.footer.icon_url, member, guild) : null
            },
            author: {
                name: textChange(embedDb.embed.author.name, member, guild),
                iconURL: isUrl(embedDb.embed.author.icon_url, member, guild) ? textChange(embedDb.embed.author.icon_url, member, guild) : null
            },
            image: {
                url: isUrl(embedDb.embed.image.url, member, guild) ? textChange(embedDb.embed.image.url, member, guild) : null
            },
            thumbnail: {
                url: isUrl(embedDb.embed.thumbnail.url, member, guild) ? textChange(embedDb.embed.thumbnail.url, member, guild) : null
            }
        })
        interaction.editReply({ embeds: [embedEdit] })
    }
})