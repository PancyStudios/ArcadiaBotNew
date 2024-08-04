import { APIEmbed } from "discord.js"
import { Schema, SchemaTypes } from "mongoose"

export type EmbedDb = {
    name: string
    guildId: string
    embed: APIEmbed
}

export const embedSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    name: { type: SchemaTypes.String, required: true },
    embed: {
        title: { type: SchemaTypes.String, required: false },
        description: { type: SchemaTypes.String, required: true },
        color: { type: SchemaTypes.Number, required: false },
        footer: {
            text: { type: SchemaTypes.String, required: false },
            icon_url: { type: SchemaTypes.String, required: false }
        },
        author: {
            name: { type: SchemaTypes.String, required: false },
            icon_url: { type: SchemaTypes.String, required: false }
        },
        image: {
            url: { type: SchemaTypes.String, required: false }
        },
        thumbnail: {
            url: { type: SchemaTypes.String, required: false }
        },
        fields: [
            {
                name: { type: SchemaTypes.String, required: false },
                value: { type: SchemaTypes.String, required: false },
                inline: { type: SchemaTypes.Boolean, required: false }
            }
        ]
    }
})