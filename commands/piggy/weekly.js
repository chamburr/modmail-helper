exports.run = async (bot, message) => {
    let tasks = bot.getTasks(message.author.id);

    if (!tasks.includes('weekly')) {
        await message.channel.createMessage({
            embed: {
                description: 'Already claimed. Try again later?',
                color: bot.config.colors.error
            }
        });
        return;
    }

    bot.addTask(message.author.id, 'weekly', bot.config.rewards.weekly);

    await message.channel.createMessage({
        embed: {
            description: `$${bot.config.rewards.weekly} has been added to the bank!`,
            color: bot.config.colors.primary
        }
    });
};

exports.help = {
    name: 'weekly',
    aliases: [],
    usage: 'weekly',
    description: 'Get the weekly reward.',
    permLevel: 0
};
