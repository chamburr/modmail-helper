module.exports = async bot => {
    console.log(`${bot.user.username}#${bot.user.discriminator} is online!`);

    await bot.editStatus('online', bot.config.status);
};
