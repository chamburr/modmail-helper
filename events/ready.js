module.exports = async bot => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online!`);

    await bot.editStatus('online', bot.config.status);

    await bot.createMessage(bot.config.channels.botEvent, {
        embed: {
            title: 'Bot Ready',
            color: 0x00ff00,
            timestamp: new Date().toISOString()
        }
    });
};
