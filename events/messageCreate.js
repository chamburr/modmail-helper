const config = require('../config.json');

const permission = [
    {
        level: 0,
        check: () => {
            return true;
        }
    },
    {
        level: 9,
        check: message => {
            return config.admins.includes(message.author.id);
        }
    },
    {
        level: 10,
        check: message => {
            return config.owners.includes(message.author.id);
        }
    }
];


module.exports = async (bot, message) => {
    if (!message) return;
    if (message.channel.type === 1) return;

    if (message.author.bot) {
        if (message.channel.id === bot.config.channels.botJoinLeave && message.embeds[0].title === 'Server Join') {
            let id = message.embeds[0].description;
            id = id.split(' ').slice(-1)[0].slice(1, -1);
            setTimeout(() => {
                bot.db.prepare('INSERT OR IGNORE INTO invite VALUES (?, ?, ?, ?)').run(id, '', 0, Date.now());
            }, 5000);
        }
        return;
    }

    let command;
    let args;
    let prefixes = [`<@${bot.user.id}>`, `<@!${bot.user.id}>`, bot.config.prefix];

    for (let prefix of prefixes) {
        if (message.content.startsWith(prefix)) {
            args = message.content.slice(prefix.length).trim().split(' ');
            command = args.shift().toLowerCase();
            break;
        }
    }

    if (!command) return;

    let cmd = bot.getCommand(command);

    if (!cmd) return;

    let permLevel = 0;
    let permOrder = permission.slice(0).sort((a, b) => (a.level < b.level ? 1 : -1));

    while (permOrder.length) {
        let currentLevel = permOrder.shift();
        if (currentLevel.check(message)) {
            permLevel = currentLevel.level;
            break;
        }
    }

    if (permLevel < cmd.help.permLevel) {
        await message.channel.createMessage({
            embed: {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.',
                color: 0xff0000
            }
        });
        return;
    }

    message.permLevel = permLevel;

    cmd.run(bot, message, args);
};
