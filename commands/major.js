module.exports = {
    run: async (bot, interaction) => {
        const title = interaction.data.options.find(o => o.name === 'title').value;
        const description = interaction.data.options.find(o => o.name === 'description').value;

        const guild = bot.guilds.get(interaction.guildID);
        const channel = guild.channels.get(bot.config.channels.status);

        const msg = await channel.createMessage({
            content: `<@&${bot.config.roles.status}>`,
            embeds: [
                {
                    title: `<:dnd:579210348666552325> ${title}`,
                    description: description,
                    color: 0xff0000,
                    timestamp: new Date().toISOString()
                }
            ]
        });

        await msg.crosspost();
        await interaction.createMessage({ content: 'Posted.', flags: 64 });
    },
    definition: {
        name: 'major',
        description: 'Post a major incident',
        permission: 'admin',
        options: [
            { type: 3, name: 'title', description: 'Incident title', required: true },
            { type: 3, name: 'description', description: 'Incident description', required: true }
        ],
        default_member_permissions: '32'
    }
};
