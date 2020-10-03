exports.run = async (bot, message) => {
  const start = new Date().getTime();
  await message.channel
    .createMessage({
      embed: {
        description: 'Checking latency...',
        color: bot.config.colors.primary
      }
    })
    .then((sentMessage) =>
      sentMessage.edit({
        embed: {
          title: 'Pong!',
          description: `Gateway latency: ${
            Math.round(message.channel.guild.shard.latency * 10) / 10
          }ms.\nHTTP API latency: ${Math.round(
            new Date().getTime() - start
          )}ms.`,
          color: bot.config.colors.primary
        }
      })
    );
};

exports.help = {
  name: 'ping',
  aliases: [],
  usage: 'ping',
  description: 'Pong! Get my latency.',
  permLevel: 0
};
