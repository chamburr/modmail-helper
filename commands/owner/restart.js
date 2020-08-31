exports.run = async (bot, message) => {
    message.channel.createMessage({
        embed: {
            description: 'Restart bot..',
            color: bot.config.colors.primary
        }
    });

    bot.disconnect({
        reconnect: false
    });
};

exports.help = {
    name: 'restart',
    aliases: [],
    usage: 'restart',
    description: 'Restart the bot.',
    permLevel: 10
};
