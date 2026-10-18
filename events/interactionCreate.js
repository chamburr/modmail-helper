module.exports = async (bot, interaction) => {
    if (interaction.type !== 2) return;
    if (interaction.guildID !== bot.config.guild) return;

    const command = bot.commands[interaction.data.name];
    if (!command) return;

    if (
        (command.definition.permission === 'owner' && !interaction.member.roles.includes(bot.config.roles.owner)) ||
        (command.definition.permission === 'admin' && !interaction.member.roles.includes(bot.config.roles.admin))
    ) {
        await interaction.createMessage({
            embeds: [
                {
                    title: 'Permission Denied',
                    description: 'You do not have permission to use this command.',
                    color: 0xff0000
                }
            ],
            flags: 64
        });
        return;
    }

    try {
        await command.run(bot, interaction);
    } catch (err) {
        console.error(err);
        await interaction
            .createMessage({
                embeds: [
                    {
                        title: 'Error',
                        description: 'Something went wrong while running this command.',
                        color: 0xff0000
                    }
                ],
                flags: 64
            })
            .catch(() => {});
    }
};
