const fs = require('fs');
const Enmap = require('enmap');
const Database = require('better-sqlite3');
const Eris = require('eris');
const express = require('express');
const config = require('./config.json');

require('express-async-errors');

const bot = new Eris(`Bot ${config.token}`, {
    compress: true,
    allowedMentions: {
        everyone: false,
        roles: true,
        users: true
    },
    getAllUsers: true,
    defaultImageFormat: 'png',
    defaultImageSize: 512
});

bot.config = config;
bot.commands = new Enmap();
bot.aliases = new Enmap();
bot.db = new Database('data.db');
bot.app = express();

require('./utils/database.js')(bot);
require('./utils/express.js')(bot);
require('./utils/cachet.js')(bot);
require('./utils/status.js')(bot);

bot.getCommand = command => {
    if (bot.commands.has(command)) {
        return bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        return bot.getCommand(bot.aliases.get(command));
    } else {
        return null;
    }
};

bot.loadCommands = () => {
    let files = fs.readdirSync('./commands/');

    files.forEach(f => {
        if (f.startsWith('.')) return;

        let files2 = fs.readdirSync(`./commands/${f}/`);
        files2.forEach(f2 => {
            if (f2.startsWith('.')) return;

            delete require.cache[require.resolve(`./commands/${f}/${f2}`)];
            let props = require(`./commands/${f}/${f2}`);

            bot.commands.set(props.help.name, {
                ...props,
                help: {
                    category: f,
                    ...props.help
                }
            });

            props.help.aliases.forEach(alias => {
                bot.aliases.set(alias, props.help.name);
            });
        });
    });
};

bot.loadEvents = () => {
    let files = fs.readdirSync('./events/');

    files.forEach(f => {
        if (f.startsWith('.')) return;

        delete require.cache[require.resolve(`./events/${f}`)];
        let props = require(`./events/${f}`);

        let event = f.split('.')[0];
        bot.removeAllListeners(event);
        bot.on(event, props.bind(null, bot));
    });
};

bot.loadCommands();
bot.loadEvents();

bot.connect();
