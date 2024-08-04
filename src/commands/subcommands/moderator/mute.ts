import { Command } from "../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType } from "discord.js";

export default new Command({
    name: 'mute',
    description: 'Mutea a un miembro',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a mutear',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'reason',
            description: 'Razón del muteo',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'time',
            description: 'Tiempo del muteo',
            type: ApplicationCommandOptionType.Number,
            required: true,
            autocomplete: true
        }
    ],
    userPermissions: ['MuteMembers'],

    auto: async ({ interaction, args }) => {
        const focus = args.getFocused(true)
        if(focus.name !== 'time') return;
        let filter = [
            {
                name: '1 minuto',
                value: 60
            },
            {
                name: '5 minutos',
                value: 300
            },
            {
                name: '15 minutos',
                value: 900
            },
            {
                name: '30 minutos',
                value: 1800
            },
            {
                name: '1 hora',
                value: 3600
            },
            {
                name: '6 horas',
                value: 21600
            },
            {
                name: '12 horas',
                value: 43200
            },
            {
                name: '24 horas',
                value: 86400
            },
            {
                name: '3 dias',
                value: 259200
            },
            {
                name: '1 semana',
                value: 604800
            }
        ]
        if(!isNaN(parseInt(focus.value))) {
            const segundos = parseInt(focus.value)
            let seg: number
            let min: number
            let horas: number
            let dias: number
    
            if(segundos >= 60) {
                seg = segundos % 60
                min = Math.floor(segundos / 60)
            }
            if(min >= 60) {
                horas = min % 60
                min = Math.floor(min / 60)
            }
            if(horas >= 24) {
                dias = horas % 24
                horas = Math.floor(horas / 24)
            }
    
            const textTime = `${dias ? `${dias} D, ` : ''}${horas ? `${horas} H, ` : ''}${min ? `${min} M, ` : ''}${seg ? `${seg} S` : ''}`
    
            interaction.respond([{ value: segundos, name: textTime }])
        }

        const filterArray = filter.filter(choice => choice.name.toLowerCase().includes(focus.value.toLowerCase()))
        interaction.respond(filterArray)
    },
    run: async ({ interaction, args }) => {
        const user = args.getUser('user')
        const reason = args.getString('reason')
        const time = args.getNumber('time')

        const member = await interaction.guild.members.fetch(user.id)
        member.timeout(time, reason)
        .then(() => {
            interaction.reply({
                content: `El miembro ${user.tag} ha sido muteado por ${time} segundos.`,
                ephemeral: true
            })
        })
        .catch((err) => {
            interaction.reply({
                content: 'No se ha podido mutear al usuario',
                ephemeral: true
            })
            console.error(err)
        })
    }
})