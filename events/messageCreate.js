module.exports = async (bot, message) => {
    if (!message) return;
    if (message.channel.type !== 0) return;

    let command, args;
    let prefixes = [`<@${bot.user.id}>`, `<@!${bot.user.id}>`, bot.config.prefix];

    for (let prefix of prefixes) {
        if (message.content.startsWith(prefix)) {
            args = message.content.slice(prefix.length).trim().split(' ');
            command = bot.commands[args.shift().toLowerCase()];
            args = args.join(' ');
            break;
        }
    }

    if (!command) return;

    if (
        (command.help.permission == 'owner' && !message.member.roles.includes(bot.config.roles.owner)) ||
        (command.help.permission == 'admin' && !message.member.roles.includes(bot.config.roles.admin))
    ) {
        await message.channel.createMessage({
            embed: {
                title: 'Permission Denied',
                description: 'You do not have permission to use this command.',
                color: 0xff0000
            }
        });
        return;
    }

    command.run(bot, message, args);
};
