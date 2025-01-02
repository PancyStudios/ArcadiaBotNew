import { Schema, SchemaTypes } from "mongoose"

export type Suggestions = {
    guildId: string,
    authorId: string,
    lastAdminId: string,
    lastAction: string,
    suggestion: string,
    status: SuggestionStatus,
    date: Date,
    upVotes: number,
    downVotes: number
    messageId: string
}

export const SuggestionSchema = new Schema({
    guildId: { type: SchemaTypes.String, required: true },
    authorId: { type: SchemaTypes.String, required: true },
    lastAdminId: { type: SchemaTypes.String, required: false },
    lastAction: { type: SchemaTypes.String, required: false },
    suggestion: { type: SchemaTypes.String, required: true },
    status: { type: SchemaTypes.Number, required: true },
    date: { type: SchemaTypes.Date, required: true },
    upVotes: { type: SchemaTypes.Number, required: true },
    downVotes: { type: SchemaTypes.Number, required: true },
    messageId: { type: SchemaTypes.String, required: false }
})

export enum SuggestionStatus {
    Pending = 0,
    Approved = 1,
    Denied = 2,
    InProgress = 3
}
