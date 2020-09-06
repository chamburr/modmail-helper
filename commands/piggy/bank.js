exports.run = async (bot, message) => {
    let total = bot.db.prepare('SELECT SUM(credit) as total FROM user').get().total;
    let leaderboard = bot.db.prepare('SELECT * FROM user ORDER BY credit DESC').all();

    let guild = bot.guilds.get(bot.config.guild);

    leaderboard = leaderboard
        .sort((a, b) => parseInt(b.credit) - parseInt(a.credit))
        .map(element => ({ member: guild.members.get(element.id), credit: element.credit }))
        .filter(element => element.member)
        .slice(0, 5)
        .map((element, index) => {
            let user = element.member.user;
            return `#${index + 1} ${user.username}#${user.discriminator} - $${element.credit}`;
        });

    let embed = {
        title: 'Piggy Bank',
        description: `Here's the info about the bank. Use \`${bot.config.prefix}profile\` to see your profile!`,
        fields: [
            {
                name: 'Total Amount',
                value: `$${total}`,
                inline: false
            },
            {
                name: 'Leaderboard',
                value: leaderboard.join('\n'),
                inline: false
            }
        ],
        color: bot.config.colors.primary
    };

    await message.channel.createMessage({ embed: embed });
};

exports.help = {
    name: 'bank',
    aliases: ['leaderboard', 'lb'],
    usage: 'bank',
    description: 'Check the piggy bank.',
    permLevel: 0
};
