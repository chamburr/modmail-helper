exports.run = async (bot, message) => {
    let channel = message.channel.guild.channels.get(bot.config.channels.status);

    let msg = await channel.createMessage({
        content: `<@&${bot.config.roles.status}>`,
        embed: {
            title: '<:online:579210349736230912> Operational',
            description: 'All services are fully operational. Please report any issues you encounter.',
            color: 0x00ff00,
            timestamp: new Date().toISOString()
        }
    });

    await msg.crosspost();
};

exports.help = {
    name: 'online',
    permission: 'admin'
};
