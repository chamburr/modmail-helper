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

    let referral = bot.referrals[member.user.id];

    if (guild.members.get(referral)) {
        let invite = bot.db.prepare('SELECT * FROM server WHERE user=?').get(member.user.id);

        if (invite) return;

        bot.getUser(member.user.id);
        bot.addCredit(member.user.id, bot.config.rewards.server);
        bot.db
            .prepare('INSERT OR IGNORE INTO server VALUES (?, ?, ?, ?)')
            .run(member.user.id, referral, bot.config.rewards.server, Date.now());

        let channel = guild.channels.get(bot.config.channels.piggy);

        await channel.createMessage({
            content: `<@${referral}>`,
            embed: {
                title: 'Thank You for Inviting!',
                description: `${bot.config.rewards.server} dollars have been added to the piggy bank.`,
                color: bot.config.colors.primary,
                footer: {
                    text: 'Server Invite'
                },
                timestamp: new Date().toISOString()
            }
        });
    }

    setTimeout(() => {
        bot.db.prepare('INSERT OR IGNORE INTO server VALUES (?, ?, ?, ?)').run(member.user.id, '', 0, Date.now());
    }, 5000);
};
