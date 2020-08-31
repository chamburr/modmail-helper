module.exports = async bot => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online!`);

    bot.editStatus('online', bot.config.status);

    bot.createMessage(bot.config.channels.botEvent, {
        embed: {
            title: 'Bot Ready',
            color: 0x00ff00,
            timestamp: new Date().toISOString()
        }
    });
};
