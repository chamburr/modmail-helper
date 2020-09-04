const axios = require('axios');
const Fuse = require('fuse');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');

module.exports = async bot => {
    let config = bot.config;

    bot.app.set('x-powered-by', false);
    bot.app.use(timeout(12000));
    bot.app.use(bodyParser.json({ type: 'application/json' }));
    bot.app.use(bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded' }));

    bot.app.get('/search', async (req, res) => {
        if (!req.query.q) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        let guild = bot.guild.get(config.guild);
        let members = guild.members.map(element => ({
            text: `${element.user.username}#${element.user.discriminator}`,
            id: element.user.id
        }));

        let fuse = new Fuse(members, {
            isCaseSensitive: true,
            threshold: 0.6,
            keys: ['text']
        });

        let results = fuse.search(req.query.q);
        results = results.slice(0, 10);
        results = results.map(element => element.item);

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.json(results);
    });

    bot.app.post('/check/github/', async (req, res) => {});

    bot.app.post('/check/review-bod', async (req, res) => {
        if (!req.query.id) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        if (!bot.getTasks(req.query.id).includes('review_bod')) {
            res.status(200).json({ error: 'Already Reviewed' });
            return;
        }

        let reviewed = await axios.get(`https://bots.ondiscord.xyz/bot-api/bots/${config.botId}/review`, {
            params: {
                owner: req.query.id
            }
        });

        if (!reviewed.data.exists) {
            res.status(200).json({ error: 'Review Not Found' });
            return;
        }

        bot.db
            .prepare('INSERT INTO task VALUES (?, ?, ?, ?)')
            .run(req.query.id, 'review_bod', config.rewards.review, Date.now());

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.piggy);

        await channel.createMessage({
            content: `<@${req.query.id}>`,
            embed: {
                title: 'Thank You for Reviewing!',
                description: `${config.rewards.review} dollars have been added to the piggy bank.`,
                color: config.colors.primary,
                footer: {
                    text: 'Bots on Discord'
                },
                timestamp: new Date().toISOString()
            }
        });

        res.status(200);
    });

    bot.app.post('/webhook/vote', async (req, res) => {
        let secret = req.header('Authorization');

        let user, type, name;

        if (secret === config.express.topgg_secret) {
            user = req.body.user;
            type = 'vote_topgg';
            name = 'Top.gg';
        } else if (secret === config.express.dbl_secret) {
            user = req.body.id;
            type = 'vote_dbl';
            name = 'Discord Bot List';
        } else if (secret === config.express.bfd_secret) {
            user = req.body.user;
            type = 'vote_bfd';
            name = 'Bots For Discord';
        } else if (secret === config.express.boat_secret) {
            user = req.body.user.id;
            type = 'vote_boat';
            name = 'Discord Boats';
        }

        if (!type) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        bot.getUser(user);
        bot.db.prepare('INSERT INTO task VALUES (?, ?, ?, ?)').run(user, type, config.rewards.vote, Date.now());

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.piggy);

        await channel.createMessage({
            content: `<@${user}>`,
            embed: {
                title: 'Thank You for Voting!',
                description: `${config.rewards.vote} dollars have been added to the piggy bank.`,
                color: config.colors.primary,
                footer: {
                    text: name
                },
                timestamp: new Date().toISOString()
            }
        });

        res.status(200);
    });

    bot.app.post('/webhook/payment', async (req, res) => {
        res.status(200);

        let query = 'cmd=_notify-validate&' + req.originalUrl.split('?')[1];
        let validity = await axios.post(`https://ipnpb.paypal.com/cgi-bin/webscr?${query}`);

        if (validity.data.toLowerCase() !== 'valid') return;
        if (req.query.receiver_email !== config.express.paypal_email) return;

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.payment);
        let member = guild.members.get(req.query.custom);
        if (!member) return;

        await channel.createMessage({
            embed: {
                title: `${req.query.payment_status} Payment`,
                fields: [
                    {
                        name: 'User',
                        value: `${member.user.username}#${member.user.discriminator} (${member.user.id})`,
                        inline: false
                    },
                    {
                        name: 'Customer',
                        value: `${req.query.first_name} ${req.query.last_name}\n${req.query.payer_email}`,
                        inline: false
                    },
                    {
                        name: 'Product',
                        value: `${req.query.item_name}\nAmount: ${req.query.mc_gross} ${req.query.mc_currency}`,
                        inline: false
                    }
                ],
                color: config.colors.primary,
                timestamp: new Date().toISOString()
            }
        });

        if (req.query.payment_status.toLowerCase() !== 'completed') return;
        if (req.query.mc_currency.toLowerCase() !== 'usd') return;

        if (parseInt(req.query.mc_gross) >= 90) {
            member.addRole(config.roles.premium5);
        } else if (parseInt(req.query.mc_gross) >= 60) {
            member.addRole(config.roles.premium3);
        } else if (parseInt(req.query.mc_gross) >= 30) {
            member.addRole(config.roles.premium1);
        } else {
            return;
        }

        await channel.createMessage({
            content: `<@${member.user.id}>`,
            embed: {
                title: `Welcome, ${member.user.username}`,
                description: `Thank you for purchasing ${req.query.item_name}! <3`,
                color: config.colors.primary,
                footer: {
                    text: 'Check out #patrons-welcome'
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

    bot.app.listen(config.express.port, async () => {
        console.log(`App ready on port ${config.express.port}!`);
    });
};
