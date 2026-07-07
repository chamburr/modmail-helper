module.exports = {
    run: async (bot, interaction) => {
        const shard = bot.shards.get(bot.guildShardMap[interaction.guildID]);

        await interaction.createMessage({
            embeds: [
                {
                    title: 'Pong!',
                    description: `My latency is ${Math.round(shard.latency * 10) / 10}ms.`,
                    color: 0x1e90ff
                }
            ]
        });
    },
    definition: {
        name: 'ping',
        description: 'Check bot latency',
        permission: 'none',
        default_member_permissions: '32'
    }
};
