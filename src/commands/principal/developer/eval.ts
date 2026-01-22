import { Command } from '../../../structures/CommandSlashSimple';
import { transpile } from 'typescript';
import { inspect } from 'util';
import {EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, LabelBuilder} from 'discord.js';

export default new Command({
    name: 'eval',
    description: 'Evaluates code',
    botPermissions: ['EmbedLinks'],
    async run({ interaction,  client }) {
        if(interaction.user.id !== '711329342193664012') return interaction.reply({ content: 'No tienes permisos para usar este comando', ephemeral: true })
        const EvalModal = new ModalBuilder()
        .setCustomId(`eval-${interaction.user.id}`)
        .setTitle('Developer Functions')

        const EvalInput = new TextInputBuilder()
        .setCustomId('code')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1010)
        .setMinLength(8)
        .setRequired(true)

        const CodeInput = new LabelBuilder()
          .setLabel('Codigo a evaluar')
          .setTextInputComponent(EvalInput)

        EvalModal.addLabelComponents(CodeInput)

        await interaction.showModal(EvalModal)

        const filter = (i) => i.customId === `eval-${interaction.user.id}`;

        const Modal = await interaction.awaitModalSubmit({ filter, time: 120_000 })
        const fields = Modal.fields

        const start = Date.now();
        let codeMain = fields.getTextInputValue('code')
        if(codeMain === '') return Modal.reply('Porfavor, inserte un código a evaluar.');
        if(codeMain.includes(client.token)) return Modal.reply('No puedes evaluar el token del bot.');

        const FirstEmbed = new EmbedBuilder()
        .setDescription(":stopwatch: Evaluando...")
        .setColor("#7289DA")

        Modal.reply({ embeds: [FirstEmbed] }).then(async msg => {
            const code = transpile(codeMain);
            console.debug('Transpiled code to JS:' + codeMain);
            try {
                const result = await eval(code);
                console.debug('Evaluated code:' + result);
                const end = Date.now();
                const time = end - start;
                const evaluated = inspect(result, { depth: 0 });

                const SecondEmbed = new EmbedBuilder()
                .setDescription(`:stopwatch: Evaluado en ${time}ms`)
                .setColor("#7289DA")
                .addFields([
                    {
                        name: "Code",
                        value: `\`\`\`ts\n${codeMain}\n\`\`\``
                    },
                    {
                        name: "Resultado",
                        value: `\`\`\`js\n${evaluated}\`\`\``
                    }
                ])
                .setFooter({ text: `Evaluado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()})
                msg.edit({ embeds: [SecondEmbed] });

            } catch (err) {
                
                console.error('Evaluated code:' + err);
                const end = Date.now();
                const time = end - start;
                const SecondEmbed = new EmbedBuilder()
                .setDescription(`:stopwatch: Evaluado en ${time}ms`)
                .setColor("#7289DA")
                .addFields([
                    {
                        name: "Code",
                        value: `\`\`\`ts\n${codeMain}\n\`\`\``
                    },
                    {
                        name: "Error",
                        value: `\`\`\`js\n${err}\n\`\`\``
                    }
                ])
                .setFooter({ text: `Evaluado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()})
                msg.edit({ embeds: [SecondEmbed] });
            }
        })
    }
})