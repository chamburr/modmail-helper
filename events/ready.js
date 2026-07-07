module.exports = async bot => {
    console.log(`${bot.user.username} is online!`);

    await bot.editStatus('online', bot.config.status);

    const commands = Object.values(bot.commands).map(({ definition }) => {
        const def = { ...definition };
        delete def.permission;
        return def;
    });
    await bot.bulkEditGuildCommands(bot.config.guild, commands);
};
