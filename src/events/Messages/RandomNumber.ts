import { Event } from '../../structures/Event';
import {db} from "../../index";
import {Document, Types} from "mongoose";
import {GuildDb} from "../../database/types/Guild";
import {Colors, EmbedBuilder} from "discord.js";

export default new Event('messageCreate', async (message) => {
	if (message.author.bot) return;
	const dbGuild = await db.guilds.findOne({ guildId: message.guild.id });
	if (!dbGuild) return;
	if (dbGuild.settings.randomNumber?.channel) {
		const number = dbGuild.settings.randomNumber?.number || 0;
		if (message.channel.id !== dbGuild.settings.randomNumber?.channel) return;
		const min = dbGuild.settings.randomNumber?.min || 1;
		const max = dbGuild.settings.randomNumber?.max || 3000;
		if (!number) {
			if(message.content.toString().startsWith('start')) {
				if(message.author.id !== '852683369899622430') return message.reply({ content: `El juego solo puede iniciarlo @imximef`});
				await generateRandomNumber(dbGuild)
				await message.channel.send('🕹️ ¡El juego ha comenzado!');
				await message.channel.send(`🎲 Adivina el número Estoy pensando en un número del ${min} al ${max}. Solo escribe tu apuesta aquí abajo.`);
			}
		} else {
			const guessedNumber = parseInt(message.content, 10);
			if (!isNaN(guessedNumber)) {
				if (guessedNumber === number) {
					const winnerDb = await db.users.findOne({ guildId: message.guild.id, userId: message.author.id });
					const newWin = winnerDb.randomNumberWins = (winnerDb.randomNumberWins || 0) + 1;
					const WinnerEmbed = new EmbedBuilder()
						.setAuthor({ name: message.author.displayName })
						.setThumbnail(message.author.displayAvatarURL())
						.setDescription(`✨ ¡Tenemos un ganador! <@${message.author.id}> acertó el número secreto: ${number}\n > ${message.author.displayName} +1 win, Ahora cuentas con ${newWin} wins!`)
						.setColor(Colors.Green)
						.setFooter({ text: `💫 - Developed by PancyStudios | 🏹 Intentos: ${winnerDb.randomNumberAttempts}` })
					await message.reply({embeds: [WinnerEmbed]})
					dbGuild.settings.randomNumber.number = null;
					await dbGuild.save();
					if (winnerDb) {
						winnerDb.randomNumberWins = newWin;
						await winnerDb.save();
					}
					await attemptsReset();

					await generateRandomNumber(dbGuild)
					await message.channel.send('🕹️ ¡El juego ha comenzado!');
					await message.channel.send(`🎲 Adivina el número Estoy pensando en un número del ${min} al ${max}. Solo escribe tu apuesta aquí abajo.`);
				} else if (guessedNumber < number) {
					await attemptsIncrement(message.author.id, message.guild.id);
					await message.react('❌');
					await message.react('⬆️');
				} else {
					await attemptsIncrement(message.author.id, message.guild.id);
					await message.react('❌');
					await message.react('⬇️');
				}
			}
		}
	}

	async function attemptsReset() {
		const users = await db.users.find({ guildId: message.guild.id });
		for (const user of users) {
			user.randomNumberAttempts = 0;
			await user.save();
		}
	}
})

async function attemptsIncrement(userId: string, guildId: string) {
	const userDb = await db.users.findOne({ guildId, userId });
	if (userDb) {
		userDb.randomNumberAttempts = (userDb.randomNumberAttempts || 0) + 1;
		await userDb.save();
	} else {
		const newUserDb = new db.users({ guildId, userId, randomNumberWins: 0, randomNumberAttempts: 1 });
		await newUserDb.save();
	}
}

async function generateRandomNumber(dbGuild: Document<unknown, {}, GuildDb, Record<string, any>, {}> & GuildDb & {
	_id: Types.ObjectId
}) {
	const min = dbGuild.settings.randomNumber?.min || 1;
	const max = dbGuild.settings.randomNumber?.max || 3000;
	const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
	dbGuild.settings.randomNumber.number = randomNum;
	await dbGuild.save();
	console.log(`Generated new random number ${randomNum} for guild ${dbGuild.guildId}`, 'RandomNumber');
}