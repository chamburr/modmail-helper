module.exports = {
    run: async (bot, interaction) => {
        const guild = bot.guilds.get(interaction.guildID);
        const channel = guild.channels.get(bot.config.channels.status);

        const msg = await channel.createMessage({
            content: `<@&${bot.config.roles.status}>`,
            embeds: [
                {
                    title: '<:online:579210349736230912> Operational',
                    description: 'All services are fully operational. Please report any issues you encounter.',
                    color: 0x00ff00,
                    timestamp: new Date().toISOString()
                }
            ]
        });

        await msg.crosspost();
        await interaction.createMessage({ content: 'Posted.', flags: 64 });
    },
    definition: {
        name: 'online',
        description: 'Post an operational status update',
        permission: 'admin',
        default_member_permissions: '32'
    }
};
