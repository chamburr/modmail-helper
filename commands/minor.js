exports.run = async (bot, message, args) => {
    args = args.split('|');
    let title = args.shift().trim();
    let description = args.join('|').trim();

    if (description === '') {
        await message.channel.createMessage({
            embed: {
                description: 'Please supply title and description, split with `|`.',
                color: 0xff0000
            }
        });
        return;
    }

    let channel = message.channel.guild.channels.get(bot.config.channels.status);

    let msg = await channel.createMessage({
        content: `<@&${bot.config.roles.status}>`,
        embed: {
            title: `<:idle:579210349203685377> ${title}`,
            description: description,
            color: 0xffd700,
            timestamp: new Date().toISOString()
        }
    });

    //await msg.crosspost();
};

exports.help = {
    name: 'minor',
    permission: 'admin'
};
