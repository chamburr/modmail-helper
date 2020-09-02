const axios = require('axios');
const cron = require('node-cron');
const config = require('../config.js');

module.exports = async bot => {
    let cachetUrl = `${config.cachet.protocol}://${config.cachet.host}:${config.cachet.port}${config.cachet.path}api/v1/`;
    let cachetClient = axios.create({
        baseURL: cachetUrl,
        headers: {
            'X-Cachet-Token': config.cachet.apiKey
        }
    });

    let comp = {};

    let components = await cachetClient.get('/components');
    components = components.data.data;

    for (let element of components) {
        comp[element.name.toLowerCase()] = element.id;
    }

    cron.schedule('* * * * *', async () => {
        let incident = await cachetClient.get('/incidents', {
            params: {
                per_page: 1
            }
        });
        incident = incident.data.data[0];

        if (!incident) return;

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.status);

        let message = (await channel.getMessages())[0];
        let embed = message.embeds[0];

        if (!embed) return;

        if (incident.status !== 4) {
            let updates = await cachetClient.get(`/incidents/${incident.id}/updates`);
            updates = updates.data;

            let content = incident.message;
            for (let update of updates) {
                content += `\n\n${update.human_status} - ${update.message}`;
            }

            let newEmbed = {
                title: '',
                description: content,
                color: config.colors.primary,
                timestamp: new Date(`${incident.created_at} UTC`).toISOString()
            };

            if (embed.title.includes('online')) {
                let status = await cachetClient.get(`/components/${comp['bot']}`);
                status = status.data.data.status;

                if (status <= 2) {
                    newEmbed.title = '<:idle:579210349203685377>';
                } else {
                    newEmbed.title = '<:dnd:579210348666552325>';
                }

                newEmbed.title += ` ${incident.name}`;

                let msg = await channel.createMessage({
                    content: `<@&${config.roles.status}>`,
                    embed: newEmbed
                });

                //await msg.crosspost();
                return;
            }

            newEmbed.title = `${embed.split(' ')[0]} ${incident.message}`;

            if (JSON.stringify(newEmbed) !== JSON.stringify(embed)) {
                await message.edit({
                    content: `<@&${config.roles.status}>`,
                    embed: newEmbed
                });
            }
        } else {
            if (!embed.title.includes('online')) {
                let newEmbed = {
                    title: '<:online:579210349736230912> Operational',
                    description: 'All services are fully operational. Please report any issues you encounter.',
                    color: config.colors.primary,
                    timestamp: Date.now().toISOString()
                };

                let msg = await channel.createMessage({
                    content: `<@&${config.roles.status}>`,
                    embed: newEmbed
                });

                //await msg.crosspost();
            }
        }
    });
};
