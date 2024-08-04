import { Command } from '../../../structures/SubCommandSlash';
import { db } from '../../..';
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
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

    auto: async({ interaction, args }) => {
        const focus = args.getFocused(true)
            if(focus.name === 'color') {  
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
        } else if(focus.name === 'embed') {
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
    run: async({ interaction, args }) => {
        
    }
})