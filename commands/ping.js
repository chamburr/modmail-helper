exports.run = async (bot, message) => {
    await message.channel.createMessage({
        embed: {
            title: 'Pong!',
            description: `My latency is ${Math.round(message.channel.guild.shard.latency * 10) / 10}ms.`,
            color: 0x1e90ff
        }
    });
};

exports.help = {
    name: 'ping',
    permission: 'none'
};
