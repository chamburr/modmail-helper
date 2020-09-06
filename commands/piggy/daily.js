exports.run = async (bot, message) => {
    let tasks = bot.getTasks(message.author.id);

    if (!tasks.includes('daily')) {
        await message.channel.createMessage({
            embed: {
                description: 'Already claimed. Try again later?',
                color: bot.config.colors.error
            }
        });
        return;
    }

    bot.addTask(message.author.id, 'daily', bot.config.rewards.daily);

    await message.channel.createMessage({
        embed: {
            description: `$${bot.config.rewards.daily} has been added to the bank!`,
            color: bot.config.colors.primary
        }
    });
};

exports.help = {
    name: 'daily',
    aliases: [],
    usage: 'daily',
    description: 'Get the daily reward.',
    permLevel: 0
};
