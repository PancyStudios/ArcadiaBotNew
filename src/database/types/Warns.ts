import { Schema, SchemaTypes } from "mongoose"

export type Warns = {
    reason: string
    moderator: string
    id: string
}

export type WarnsDb = {
    guildId: string
    userId: string
    warns: Warns[]
}

export const warnsSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    userId: { type: SchemaTypes.String, required: true },
    warns: { type: SchemaTypes.Array, required: true }
})