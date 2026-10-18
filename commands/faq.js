const faqs = require('../data/faqs.js');

const buildEmbed = async (bot, guildID, faq) => {
    const embed = {
        title: faq.title,
        description: faq.description,
        fields: faq.fields ? [...faq.fields] : [],
        color: 0x1e90ff
    };

    if (faq.image) embed.image = { url: faq.image };
    if (faq.related) embed.footer = { text: 'Related: ' + faq.related.map(r => `/faq ${r}`).join(', ') };

    if (faq.status) {
        const guild = bot.guilds.get(guildID);
        const channel = guild.channels.get(bot.config.channels.status);
        const msg = channel
            ? await Promise.race([
                  channel.getMessages({ limit: 1 }).then(m => m[0]),
                  new Promise(resolve => setTimeout(resolve, 2000))
              ]).catch(() => undefined)
            : undefined;

        embed.fields.push({
            name: 'Latest Status',
            value: msg
                ? `${msg.embeds[0]?.title ?? 'Status update'}\n[View the post](https://discord.com/channels/${guild.id}/${channel.id}/${msg.id})`
                : 'Check the status channel for the latest updates.'
        });
    }

    return embed;
};

module.exports = {
    run: async (bot, interaction) => {
        const key = interaction.data.options.find(o => o.name === 'topic').value;
        const user = interaction.data.options.find(o => o.name === 'user');
        const faq = faqs.find(f => f.key === key);

        if (!faq) {
            await interaction.createMessage({
                embeds: [{ title: 'Unknown Topic', description: 'That FAQ topic does not exist.', color: 0xff0000 }],
                flags: 64
            });
            return;
        }

        await interaction.createMessage({
            content: user ? `<@${user.value}>` : undefined,
            embeds: [await buildEmbed(bot, interaction.guildID, faq)]
        });
    },
    autocomplete: async (bot, interaction) => {
        const query = interaction.data.options.find(o => o.focused).value.toLowerCase();

        const choices = faqs
            .filter(f => f.key.includes(query) || f.name.toLowerCase().includes(query))
            .slice(0, 25)
            .map(f => ({ name: `${f.key}: ${f.name}`, value: f.key }));

        await interaction.result(choices);
    },
    buildEmbed,
    definition: {
        name: 'faq',
        description: 'Send the answer to a common question',
        permission: 'staff',
        options: [
            { type: 3, name: 'topic', description: 'FAQ topic', required: true, autocomplete: true },
            { type: 6, name: 'user', description: 'User to mention', required: false }
        ]
    }
};
