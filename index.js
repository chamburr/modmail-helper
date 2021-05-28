const fs = require('fs');
const Eris = require('eris');
const config = require('./config.json');

const bot = new Eris(`Bot ${config.token}`, {
    allowedMentions: {
        everyone: false,
        roles: true,
        users: true
    },
    getAllUsers: true,
    restMode: true,
    intents: 771
});

bot.config = config;
bot.commands = {};

fs.readdirSync('./commands/').forEach(f => {
    if (f.startsWith('.')) return;

    delete require.cache[require.resolve(`./commands/${f}`)];
    let props = require(`./commands/${f}`);

    bot.commands[props.help.name] = props;
});

fs.readdirSync('./events/').forEach(f => {
    if (f.startsWith('.')) return;

    delete require.cache[require.resolve(`./events/${f}`)];
    let props = require(`./events/${f}`);

    bot.removeAllListeners(f.split('.')[0]);
    bot.on(f.split('.')[0], props.bind(null, bot));
});

bot.connect();
