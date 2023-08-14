exports.run = async (bot, message, args) => {
    if (!args) {
        await message.channel.createMessage({
            embed: {
                description: 'Please supply something to evaluate.',
                color: 0xff0000
            }
        });
        return;
    }

    try {
        let evaled = await eval('(async () => { ' + args + ' })()');

        if (typeof evaled !== 'string') {
            evaled = require('util').inspect(evaled);
        }

        evaled = evaled.replace(new RegExp('`', 'g'), '`' + String.fromCharCode(8203));

        await message.channel.createMessage({
            embed: {
                description: '```js\n' + evaled.substr(0, 2000) + '```',
                color: 0x1e90ff
            }
        });
    } catch (err) {
        await message.channel.createMessage({
            embed: {
                description: '```' + err.toString().substr(0, 2000) + '```',
                color: 0xff0000
            }
        });
    }
};

exports.help = {
    name: 'eval',
    permission: 'owner'
};
