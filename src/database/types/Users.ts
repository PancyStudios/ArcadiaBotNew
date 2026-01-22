import {Schema} from "mongoose";

export type UserGuild = {
		guildId: string
		userId: string
		randomNumberWins: number
		randomNumberAttempts?: number
}

export const UserSchema = new Schema({
		guildId: { type: String, required: true },
		userId: { type: String, required: true },
		randomNumberWins: { type: Number, required: true, default: 0 }
})