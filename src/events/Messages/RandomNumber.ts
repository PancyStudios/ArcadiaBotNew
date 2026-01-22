import { Event } from '../../structures/Event.js';
import {db} from "../../index.js";

export default new Event('messageCreate', async (message) => {
		if (message.author.bot) return;
		const dbGuild = await db.guilds.findOne({ id: message.guild.id });
		if (!dbGuild) return;
		const number = dbGuild.settings.randomNumber?.number
		if (!number) {
			if(message.content.startsWith('start')) {
				const min = dbGuild.settings.randomNumber?.min || 1;
				const max = dbGuild.settings.randomNumber?.max || 3000;
				const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
				dbGuild.settings.randomNumber.number = randomNum;
				await dbGuild.save();
				message.channel.send(`¡He seleccionado un número aleatorio entre ${min} y ${max}! ¡Intenta adivinarlo!`);
			}
		} 

})