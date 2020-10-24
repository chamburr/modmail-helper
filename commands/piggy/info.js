exports.run = async (bot, message) => {
    await message.channel.createMessage({
        embed: {
            title: 'About Piggy Bank',
            description:
                'Piggy bank gives you coins for completing tasks! There is nothing you can do with the coins yet. :(',
                //'Piggy bank is a project to reward members of the community! It is simple:\n' +
                //'- Engage with us and complete the tasks\n' +
                //'- Receive money in the community piggy bank\n' +
                //'- Get nifty rewards like Nitro, premium and more',
            fields: [
                {
                    name: 'How do I get started?',
                    value:
                        `View the tasks with \`${bot.config.prefix}tasks\`, follow the instructions and complete them.` +
                        `Then, use \`${bot.config.prefix}profile\` to check your profile or \`${bot.config.prefix}bank\` to see the bank!`,
                    inline: false
                },
                //{
                //    name: 'How do I receive rewards?',
                //    value:
                //        'Every month, the piggy bank will be opened and rewards will be given out randomly. ' +
                //        'The more there is in the bank, the better the rewards! ' +
                //        'And the more you contribute, the higher your chance of receiving something!',
                //    inline: true
                //}
            ],
            color: bot.config.colors.primary
        }
    });
};

exports.help = {
    name: 'info',
    aliases: ['about'],
    usage: 'info',
    description: 'Learn more about piggy bank.',
    permLevel: 0
};
