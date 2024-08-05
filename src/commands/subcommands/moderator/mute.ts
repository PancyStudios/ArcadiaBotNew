import { Command } from "../../../structures/SubCommandSlash";
import { ApplicationCommandOptionType, Embed, EmbedBuilder } from "discord.js";

export default new Command({
    name: 'mute',
    description: 'Mutea a un miembro',
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        {
            name: 'user',
            description: 'Usuario a silenciar',
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
    botPermissions: ['MuteMembers'],

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

        let choices2 = []
        if(!isNaN(parseInt(focus.value))) {
            const segundos = parseInt(focus.value)
            let seg: number
            let min: number
            let horas: number
            let dias: number
            
            seg = segundos
            if(seg >= 60) {
                min = Math.floor(seg / 60)
                seg = segundos % 60
            }
            if(min >= 60) {
                horas = Math.floor(min / 60)
                min = min % 60
            }
            if(horas >= 24) {
                dias = Math.floor(horas / 24)
                dias = horas % 24
            }
            const textTime = `${dias ? `${dias} D ` : ''}${horas ? `${horas} H ` : ''}${min ? `${min} M ` : ''}${seg ? `${seg} S` : ''}`
            choices2.push({ name: textTime, value: segundos })
            if(interaction.responded) return;
            return interaction.respond(choices2)
        }

        const filterArray = filter.filter(choice => choice.name.toLowerCase().includes(focus.value.toLowerCase()))
        if(filterArray.length === 0) return interaction.respond([{ name: 'No se han encontrado resultados', value: 1800 }])
        interaction.respond(filterArray)
    },
    run: async ({ interaction, args }) => {
        const user = args.getUser('user')
        const reason = args.getString('reason')
        const time = args.getNumber('time')

        const member = await interaction.guild.members.fetch(user.id)
        if(interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedes silenciar a un usuario con un rol igual o superior al tuyo.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        const me = await interaction.guild.members.fetch(interaction.client.user.id)
        if(me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo silenciar a este usuario debido a que tiene un rol igual o superior al mio.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        if(member.permissions.has(['Administrator']) || member.permissions.has(['MuteMembers'])) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo silenciar a este usuario debido a que tiene el permiso `MuteMembers`.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        if(!member.moderatable) return interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle('⚒️ - Error de permisos')
            .setDescription('No puedo silenciar a este usuario.')
            .setColor('Red')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
        ], ephemeral: true })
        member.timeout(time * 1000, reason)
        .then(() => {
            let seg: number
            let min: number
            let horas: number
            let dias: number
            
            seg = time
            if(seg >= 60) {
                min = Math.floor(seg / 60)
                seg = time % 60
            }
            if(min >= 60) {
                horas = Math.floor(min / 60)
                min = min % 60
            }
            if(horas >= 24) {
                dias = Math.floor(horas / 24)
                dias = horas % 24
            }
            const textTime = `${dias ? `${dias} D ` : ''}${horas ? `${horas} H ` : ''}${min ? `${min} M ` : ''}${seg ? `${seg} S` : ''}`

            const MuteEmbedChannel = new EmbedBuilder()
            .setTitle('🔇 - Usuario silenciado')
            .setDescription(`El usuario ${user.tag} ha sido silenciado con exito

                > Tiempo: ${textTime} (<t:${Math.floor(Date.now() / 1000) + time}:R>)
                > Razón: ${reason}
                > Moderador: ${interaction.user.id}`)
            .setColor('Green')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })

            const MuteEmbedUser = new EmbedBuilder()
            .setTitle('🔇 - Has sido silenciado')
            .setDescription(`Has sido silenciado en el servidor ${interaction.guild.name}

                > Tiempo: ${textTime} (<t:${Math.floor(Date.now() / 1000) + time}:R>)
                > Razón: ${reason}`)
            .setColor('Orange')
            .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
            
            interaction.reply({
                embeds: [MuteEmbedChannel],
            })

            user.send({ embeds: [MuteEmbedUser] }).catch(() => { console.warn('El usuario tiene el md cerrado' )})
        })
        .catch((err: Error) => {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle('⚒️ - Error al silenciar')
                    .setDescription(`Ocurrio un error al intentar silenciar al usuario ${user.tag}\nEl error es el siguiente:\`\`\`js\n${err.message || ''} ${err.cause || ''} ${err.name || ''} ${err.stack|| ''}\`\`\``)
                    .setColor('Red')
                    .setFooter({ text: '💫 - Developed by PancyStudios', iconURL: interaction.guild.iconURL() })
                ],
                ephemeral: true
            })
            console.error(err)
        })
    }
})