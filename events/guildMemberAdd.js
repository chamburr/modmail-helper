module.exports = async (bot, guild, member) => {
    if (guild.id !== bot.config.guild) return;

    await bot.createMessage(bot.config.channels.joinLeave, {
        embed: {
            title: 'Member Join',
            description: `${member.user.username}#${member.user.discriminator} (${member.user.id})`,
            footer: {
                text: `${guild.members.size} members`
            },
            color: 0x00ff00,
            timestamp: new Date().toISOString()
        }
    });
};
