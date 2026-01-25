import { Event } from "../../structures/Event";
import { db } from "../..";
import { editSuggestionMessage } from "../../utils/func";
import { SuggestionStatus} from "../../database/types/Suggestions";

export default new Event('messageReactionAdd', async(reaction, user) => {
    const { message, emoji } = reaction
    const { guild } = message
    const { suggestions } = db
    const finalMsg = await message.fetch(true)
    const suggest = await suggestions.findOne({ messageId: finalMsg.id })
    if(!suggest) return;
    if(suggest.status === SuggestionStatus.Approved || suggest.status === SuggestionStatus.Denied) return await reaction.remove();
    if(emoji.name === '🔼') {
        try {
            suggest.upVotes += 1
            await suggest.save()
            await editSuggestionMessage(finalMsg)
        } catch (e) {
            await user.send({ content: `❌ | Ha ocurrido un error al registrar tu voto en la sugerencia del servidor **${guild?.name || 'Desconocido'}**. Por favor, inténtalo de nuevo más tarde.` }).catch(() => null)
            return await reaction.remove()
        }
    } else if(emoji.name === '🔽') {
        try {
            suggest.downVotes += 1
            await suggest.save()
            await editSuggestionMessage(finalMsg)
        } catch {
            await user.send({ content: `❌ | Ha ocurrido un error al registrar tu voto en la sugerencia del servidor **${guild?.name || 'Desconocido'}**. Por favor, inténtalo de nuevo más tarde.` }).catch(() => null)
            return await reaction.remove()
        }
    } else {
        await user.send({ content: `❌ | El emoji que has usado no es válido para votar la sugerencia en el servidor **${guild?.name || 'Desconocido'}**. Por favor, utiliza los emojis correctos para votar.` }).catch(() => null)
        return await reaction.remove()
    }
})
