const axios = require('axios');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const express = require('express');
require('express-async-errors');

module.exports = async bot => {
    bot.app = express();

    // eslint-disable-next-line no-unused-vars
    function keepRawBody(req, res, buf, encoding) {
        req.rawBody = buf;
    }

    bot.app.set('x-powered-by', false);
    bot.app.use(timeout(12000));
    bot.app.use(
        bodyParser.json({
            type: 'application/json',
            verify: keepRawBody
        })
    );
    bot.app.use(
        bodyParser.urlencoded({
            type: 'application/x-www-form-urlencoded',
            extended: true,
            verify: keepRawBody
        })
    );

    bot.app.post('/webhook/payment', async (req, res) => {
        res.status(200).end();

        let query = 'cmd=_notify-validate&' + req.rawBody;
        let validity = await axios.post('https://ipnpb.paypal.com/cgi-bin/webscr', query);

        if (validity.data.toLowerCase() !== 'verified') return;
        if (req.body.receiver_email !== bot.config.express.paypalEmail) return;

        let guild = bot.guilds.get(bot.config.guild);
        let channel = guild.channels.get(bot.config.channels.payment);
        let member = guild.members.get(req.body.custom);
        let user = member ? member.user : await bot.getRESTUser(req.body.custom);

        if (!user) return;

        await channel.createMessage({
            embed: {
                title: `${req.body.payment_status} Payment`,
                fields: [
                    {
                        name: 'User',
                        value: `${user.username}#${user.discriminator} (${user.id})`,
                        inline: false
                    },
                    {
                        name: 'Customer',
                        value: `${req.body.first_name} ${req.body.last_name} (${req.body.payer_email})`,
                        inline: false
                    },
                    {
                        name: 'Product',
                        value: `${req.body.item_name}\nAmount: ${req.body.mc_gross} ${req.body.mc_currency}`,
                        inline: false
                    }
                ],
                color: 0x1e90ff,
                timestamp: new Date().toISOString()
            }
        });

        if (req.body.payment_status.toLowerCase() !== 'completed') return;
        if (req.body.mc_currency.toLowerCase() !== 'usd') return;

        let count = 0;
        while (!member) {
            if (count >= 360) return;
            count++;
            await new Promise(r => setTimeout(r, 10000));
            member = guild.members.get(req.body.custom);
        }

        if (parseInt(req.body.mc_gross) >= 90) {
            member.addRole(bot.config.roles.premium5);
        } else if (parseInt(req.body.mc_gross) >= 60) {
            member.addRole(bot.config.roles.premium3);
        } else if (parseInt(req.body.mc_gross) >= 30) {
            member.addRole(bot.config.roles.premium1);
        } else {
            return;
        }

        channel = guild.channels.get(bot.config.channels.patron);

        await channel.createMessage({
            content: `<@${member.user.id}>`,
            embed: {
                title: `Welcome, ${member.user.username}`,
                description: `Thank you for purchasing ${req.body.item_name}! <3`,
                color: 0x1e90ff,
                footer: {
                    text: 'Check out #patrons-welcome!'
                },
                timestamp: new Date().toISOString()
            }
        });
    });

    // eslint-disable-next-line no-unused-vars
    bot.app.use(async (err, req, res, next) => {
        console.error(err.stack);
        if (req.timedout) {
            res.status(503).json({ error: 'Service Unavailable' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    bot.app.use(async (req, res) => {
        res.status(404).json({ error: 'Page Not Found' });
    });

    bot.app.listen(bot.config.express.port, async () => {
        console.log(`App ready on port ${bot.config.express.port}!`);
    });
};
