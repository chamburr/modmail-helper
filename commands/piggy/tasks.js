const { decToHex } = require('hex2dec');

exports.run = async (bot, message) => {
    let tasks = bot.getTasks(message.author.id);

    let embed = {
        title: 'Tasks',
        description:
            'Complete these tasks to receive money in the piggy bank.' +
            `They can be exchanged for rewards! Type \`${bot.config.prefix}info\` for details.`,
        fields: [],
        color: bot.config.colors.primary
    };

    if (tasks.includes('daily')) {
        embed.fields.push({
            name: `Daily reward - $${bot.config.rewards.daily}`,
            value: `Type \`${bot.config.prefix}daily\`.`,
            inline: false
        });
    }

    if (tasks.includes('weekly')) {
        embed.fields.push({
            name: `Weekly reward - $${bot.config.rewards.weekly}`,
            value: `Type \`${bot.config.prefix}weekly\`.`,
            inline: false
        });
    }

    if (tasks.includes('github')) {
        embed.fields.push({
            name: `Star GitHub repository - $${bot.config.rewards.github}`,
            value:
                `Star our GitHub repository [here](${bot.config.links.github}). ` +
                'Then, connect your GitHub account to Discord and visit [this link](https://api.modmail.xyz/check/github) to verify.',
            inline: false
        });
    }

    if (tasks.includes('review_bod')) {
        embed.fields.push({
            name: `Review the bot - $${bot.config.rewards.review}`,
            value:
                `Review the bot [here](${bot.config.links.bod}). ` +
                'Then, visit [this link](https://api.modmail.xyz/check/review-bod) to verify.',
            inline: false
        });
    }

    if (tasks.find(element => element.startsWith('vote'))) {
        let voteTasks = [];

        for (let task of tasks.filter(element => element.startsWith('vote'))) {
            if (task === 'vote_topgg') {
                voteTasks.push(`[Top.gg](${bot.config.links.topgg})`);
            } else if (task === 'vote_dbl') {
                voteTasks.push(`[Discord Bot List](${bot.config.links.dbl})`);
            } else if (task === 'vote_bfd') {
                voteTasks.push(`[Bots For Discord](${bot.config.links.bfd})`);
            } else if (task === 'vote_boat') {
                voteTasks.push(`[Discord Boats](${bot.config.links.boat})`);
            }
        }

        embed.fields.push({
            name: `Vote for the bot - $${bot.config.rewards.vote} each`,
            value: 'Vote for our bot in the following places:\n' + voteTasks.join('\n'),
            inline: false
        });
    }

    if (tasks.includes('invite')) {
        let id = decToHex(message.author.id, { prefix: false });
        let remaining = bot.config.limits.invite - tasks.filter(element => element === 'invite').length;

        embed.fields.push({
            name: `Refer a friend to invite bot - $${bot.config.rewards.invite} each`,
            value:
                'Ask someone to invite the bot using your link.\n' +
                `https://modmail.xyz/invite/${id} (${remaining}/${bot.config.limits.invite} uses today)`,
            inline: false
        });
    }

    if (tasks.includes('server')) {
        let id = decToHex(message.author.id, { prefix: false });
        let remaining = bot.config.limits.server - tasks.filter(element => element === 'server').length;

        embed.fields.push({
            name: `Refer a friend to join server - $${bot.config.rewards.invite} each`,
            value:
                'Invite someone to join this server using your link.\n' +
                `https://modmail.xyz/support/${id} (${remaining}/${bot.config.limits.server} uses today)`,
            inline: false
        });
    }

    await message.channel.createMessage({ embed: embed });
};

exports.help = {
    name: 'tasks',
    aliases: ['task'],
    usage: 'tasks',
    description: 'See the incompleted tasks.',
    permLevel: 0
};
