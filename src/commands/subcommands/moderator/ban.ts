import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js";
import { Command } from "../../../structures/SubCommandSlash";
import { db } from "../../..";

export default new Command({
    name: 'ban',
    description: 'Banea a un miembro',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a banear',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'reason',
            description: 'Razón del baneo',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'delete_messages',
            description: 'Mensajes a eliminar',
            type: ApplicationCommandOptionType.Number,
            required: false,
            autocomplete: true
        }
    ],
    botPermissions: ['BanMembers'],

    auto: async ({ interaction, args }) => {
        const focus = args.getFocused(true)
        if(focus.name === 'delete_messages') {
            let choices: ApplicationCommandOptionChoiceData<number>[] = [
                {
                    name: 'No eliminar nada',
                    value: 0
                },
                {
                    name: 'Ultima hora',
                    value: 3600
                },
                {
                    name: 'Ultimas 6 horas',
                    value: 21600
                },
                {
                    name: 'Ultimas 12 horas',
                    value: 43200
                },
                {
                    name: 'Ultimas 24 horas',
                    value: 86400
                },
                {
                    name: 'Ultimas 3 dias',
                    value: 259200
                },
                {
                    name: 'Ultima semana',
                    value: 604800
                },
            ]
            
            const filter = choices.filter(choice => choice.name.toLowerCase().includes(focus.value.toLowerCase()))
            interaction.respond(filter)
        }
    },
    run: async ({ interaction, args, client }) => {
        const user = args.getUser('user')
        const reason = args.getString('reason')
        const deleteMessages = args.getNumber('delete_messages')
        const member = await interaction.guild.members.fetch(user.id)
        const me = await interaction.guild.members.fetchMe()
        if(!member) return interaction.reply({ content: 'No se ha podido encontrar al miembro, usa /hackban (id) para banear a este usuario', ephemeral: true })
        if(!member.bannable) return interaction.reply({ content: 'No puedo banear a este usuario', ephemeral: true })
        if(interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ content: 'El usuario tiene igual o menor rango que tu', ephemeral: true })
        if(me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ content: 'No puedo banear a este usuario debido a que tiene un rango igual o mayor que el mio', ephemeral: true })
        
        const ban = await member.ban({ reason: reason, deleteMessageSeconds: deleteMessages }).catch((err) => {
            interaction.reply({ content: 'No se ha podido banear al usuario', ephemeral: true })
            return
        })
        if(!ban) return
        const inter = await interaction.reply({ content: `El usuario ${user.tag} ha sido baneado` }).catch((err) => {
            return
        })
        if(!inter) return
        const msg = await inter?.fetch().catch((err) => {
            return
        })
        if(!msg) return

        const date = new Date()
        const dateTimestamp = date.getTime() / 1000
        dateTimestamp.valueOf()

        const msgUrl = msg.url
        const embed = new EmbedBuilder()
        .setAuthor({ name: '🔨 - Baneo exitoso', iconURL: user.avatarURL(), url: msgUrl ?? null })
        .setColor('Orange')
        .setDescription(`🍂 Usuario baneado: ${user.username} (${user.id})
            🍁 Razón: ${reason}
            
            ⚒️ - Acción realizada por: ${interaction.user.username} (${interaction.user.id})
            🛡️ - Realizado en el canal: ${interaction.channel.url}

            🕒 - Fecha: <t:${dateTimestamp.valueOf()}>`)
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.client.user.avatarURL() })
        
        interaction.reply({ embeds: [embed] }).catch((_err) => {})

        const { global } = db
        const guild = await global.findOne({ botId: client.user.id})
        if(!guild) return;
        if(!guild.bansGlobalRegister) return;
        const globalChannel = await client.channels.fetch(guild.bansGlobalRegister) as TextChannel
        if(!globalChannel) return;
        globalChannel.send({ embeds: [embed] }).catch((err) => {
            console.log(err)
            return
        })
    }   
})