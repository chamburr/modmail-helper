exports.run = async (bot, message, args) => {
    let prefix = bot.config.prefix;

    if (args[0]) {
        let cmd = bot.getCommand(args[0]);
        if (!cmd) {
            message.channel.createMessage({
                embed: {
                    description: `That command does not exist. Use \`${prefix}help\` to see all the commands`,
                    color: bot.config.colors.error
                }
            });
            return;
        }

        let embed = {
            title: cmd.help.name,
            description: cmd.help.description,
            fields: [
                {
                    name: 'Usage',
                    value: '```' + prefix + cmd.help.usage + '```'
                }
            ],
            color: bot.config.colors.primary
        };

        if (cmd.help.aliases.length > 0) {
            embed.fields.push({
                name: 'Aliases',
                value: '`' + cmd.help.aliases.join('`, `') + '`'
            });
        }

        message.channel.createMessage({
            embed: embed
        });

        return;
    }

    let commands = {};

    bot.config.modules.forEach(module => {
        commands[module] = [];
    });

    bot.commands.forEach(cmd => {
        if (cmd.help.permLevel > message.permLevel) return;
        commands[cmd.help.category].push(cmd.help.name);
    });

    let embed = {
        title: `${bot.user.username} Help Menu`,
        description: `My prefix is \`${prefix}\`.\nSee more information on a command with \`${prefix}help <command>\`.`,
        fields: [],
        color: bot.config.colors.primary
    };

    for (let category in commands) {
        embed.fields.push({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            value: commands[category].join('\n'),
            inline: true
        });
    }

    message.channel.createMessage({
        embed: embed
    });
};

exports.help = {
    name: 'help',
    aliases: ['h', 'commands'],
    usage: 'help [command]',
    description: 'Shows the help menu or information for a specific command when specified.',
    permLevel: 0
};
