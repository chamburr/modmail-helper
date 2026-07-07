module.exports = {
    run: async (bot, interaction) => {
        const description = interaction.data.options.find(o => o.name === 'description').value;

        const guild = bot.guilds.get(interaction.guildID);
        const channel = guild.channels.get(bot.config.channels.status);
        const msg = (await channel.getMessages())[0];
        const embed = msg.embeds[0];

        await msg.edit({
            content: `<@&${bot.config.roles.status}>`,
            embeds: [
                {
                    title: embed.title,
                    description: embed.description + `\n\nUpdate: ${description}`,
                    color: embed.color,
                    timestamp: embed.timestamp
                }
            ]
        });

        await interaction.createMessage({ content: 'Updated.', flags: 64 });
    },
    definition: {
        name: 'update',
        description: 'Append an update to the latest status post',
        permission: 'admin',
        options: [{ type: 3, name: 'description', description: 'Update description', required: true }],
        default_member_permissions: '32'
    }
};
