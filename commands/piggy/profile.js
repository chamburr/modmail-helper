exports.run = async (bot, message) => {
    let user = bot.getUser(message.author.id);

    let task = bot.db.prepare('SELECT * FROM task WHERE user=?').all(message.author.id);
    let invite = bot.db.prepare('SELECT * FROM invite WHERE referrer=?').all(message.author.id);
    let server = bot.db.prepare('SELECT * FROM server WHERE referrer=?').all(message.author.id);

    let recents = [...task, ...invite, ...server];
    recents = recents.sort((a, b) => parseInt(b.created) - parseInt(a.created)).slice(0, 5);

    recents = recents.map(element => {
        if (element.referrer && element.guild) {
            element.type = 'invite';
        } else if (element.referrer && element.user) {
            element.type = 'server';
        }

        let name = '';
        if (element.type === 'daily') name = 'Claimed daily reward';
        else if (element.type === 'weekly') name = 'Claimed weekly reward';
        else if (element.type === 'github') name = 'Starred GitHub repository';
        else if (element.type === 'review_bod') name = 'Reviewed the bot';
        else if (element.type.startsWith('vote')) name = 'Voted for the bot';
        else if (element.type === 'invite') name = 'Referred a friend to invite bot';
        else if (element.type === 'server') name = 'Referred a friend to join server';

        return `- ${name} ($${element.reward}).`;
    });

    if (recents.length === 0) {
        recents.push('*None*');
    }

    let embed = {
        title: 'Profile',
        description: `Here's your profile. Use \`${bot.config.prefix}tasks\` to see how to get more money!`,
        fields: [
            {
                name: 'Username',
                value: `${message.author.username}#${message.author.discriminator}`,
                inline: true
            },
            {
                name: 'Balance',
                value: `$${user.credit}`,
                inline: true
            },
            {
                name: 'Recent activity',
                value: recents.join('\n'),
                inline: false
            }
        ],
        color: bot.config.colors.primary
    };

    await message.channel.createMessage({ embed: embed });
};

exports.help = {
    name: 'profile',
    aliases: ['p'],
    usage: 'profile',
    description: 'See your profile.',
    permLevel: 0
};
