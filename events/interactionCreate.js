module.exports = async (bot, interaction) => {
    if (interaction.guildID !== bot.config.guild) return;

    if (interaction.type === 4) {
        const command = bot.commands[interaction.data.name];
        if (command && command.autocomplete) command.autocomplete(bot, interaction);
        return;
    }

    if (interaction.type === 3) {
        const command = bot.commands[interaction.data.custom_id.split(':')[0]];
        if (command && command.component) command.component(bot, interaction);
        return;
    }

    if (interaction.type !== 2) return;

    const command = bot.commands[interaction.data.name];
    if (!command) return;

    const staff = bot.config.roles.staff || [];

    if (
        (command.definition.permission === 'owner' && !interaction.member.roles.includes(bot.config.roles.owner)) ||
        (command.definition.permission === 'admin' && !interaction.member.roles.includes(bot.config.roles.admin)) ||
        (command.definition.permission === 'staff' && !interaction.member.roles.some(r => staff.includes(r)))
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
