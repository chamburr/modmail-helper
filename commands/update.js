exports.run = async (bot, message, args) => {
    if (args === '') {
        await message.channel.createMessage({
            embed: {
                description: 'Please supply the description.',
                color: 0xff0000
            }
        });
        return;
    }

    let channel = message.channel.guild.channels.get(bot.config.channels.status);
    let msg = (await channel.getMessages())[0];
    let embed = msg.embeds[0];

    await msg.edit({
        content: `<@&${bot.config.roles.status}>`,
        embed: {
            title: embed.title,
            description: embed.description + `\n\nUpdate: ${args}`,
            color: embed.color,
            timestamp: embed.timestamp
        }
    });
};

exports.help = {
    name: 'update',
    permission: 'admin'
};
