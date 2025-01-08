import { Event } from "../../structures/Event";
import { clientExtend as client } from "../..";
import { db } from "../..";
import { EmbedBuilder } from "discord.js";
import { SuggestionStatus } from "../../database/types/Suggestions";

export default new Event('messageReactionRemove', async(reaction, user) => {
    const { message, emoji } = reaction
    const { guild } = message
    const { suggestions } = db
    if(message.partial) await message.fetch()   
    const suggest = await suggestions.findOne({ messageId: message.id })
    if(!suggest) return;

    const { suggestion, status, adminComment, lastAdminId, date, upVotes, downVotes } = suggest
    if(status === SuggestionStatus.Approved || status === SuggestionStatus.Denied) return;
    if(emoji.name === '🔼') {
        
    } else if(emoji.name === '🔽') {
        
    } else {
        return await reaction.remove()
    }
})