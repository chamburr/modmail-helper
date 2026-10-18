const faqs = require('../data/faqs.js');
const { buildEmbed } = require('./faq.js');

module.exports = {
    run: async (bot, interaction) => {
        const message = interaction.data.resolved.messages.get(interaction.data.target_id);
        const matches = faqs.filter(f => f.match && f.match.test(message.content));
        const others = faqs.filter(f => !matches.includes(f));

        await interaction.createMessage({
            content: matches.length
                ? `Suggested: ${matches.map(f => `**${f.name}**`).join(', ')}`
                : 'No suggestions for this message, pick a topic below.',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: `${module.exports.definition.name}:${message.id}`,
                            placeholder: 'Pick a topic to reply with',
                            options: [...matches, ...others].map(f => ({
                                label: f.name,
                                value: f.key,
                                description: matches.includes(f) ? 'Suggested for this message' : undefined
                            }))
                        }
                    ]
                }
            ],
            flags: 64
        });
    },
    component: async (bot, interaction) => {
        const messageID = interaction.data.custom_id.split(':')[1];
        const faq = faqs.find(f => f.key === interaction.data.values[0]);

        await interaction.deferUpdate();

        await bot.createMessage(interaction.channel.id, {
            embeds: [await buildEmbed(bot, interaction.guildID, faq)],
            messageReference: { messageID, failIfNotExists: false }
        });

        await interaction.editOriginalMessage({ content: `Sent **${faq.name}**.`, components: [] });
    },
    definition: {
        name: 'Answer with FAQ',
        type: 3,
        permission: 'staff'
    }
};
