module.exports = {
    run: async (bot, interaction) => {
        const args = interaction.data.options.find(o => o.name === 'code').value;

        try {
            let evaled = await eval('(async () => { ' + args + ' })()');

            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled);
            }

            evaled = evaled.replace(new RegExp('`', 'g'), '`' + String.fromCharCode(8203));

            await interaction.createMessage({
                embeds: [{ description: '```js\n' + evaled.substr(0, 2000) + '```', color: 0x1e90ff }],
                flags: 64
            });
        } catch (err) {
            await interaction.createMessage({
                embeds: [{ description: '```' + err.toString().substr(0, 2000) + '```', color: 0xff0000 }],
                flags: 64
            });
        }
    },
    definition: {
        name: 'eval',
        description: 'Evaluate JavaScript code',
        permission: 'owner',
        options: [{ type: 3, name: 'code', description: 'Code to evaluate', required: true }],
        default_member_permissions: '32'
    }
};
