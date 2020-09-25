const axios = require('axios');
const DiscordOauth2 = require('discord-oauth2');
const { Octokit } = require('@octokit/rest');
const { hexToDec } = require('hex2dec');
const bodyParser = require('body-parser');
const timeout = require('connect-timeout');

module.exports = async bot => {
    let config = bot.config;

    bot.oauth = new DiscordOauth2({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: 'https://api.modmail.xyz/check/github'
    });

    bot.referrals = {};

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

    bot.app.get('/user', async (req, res) => {
        if (!req.query.id && !req.query.code) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');

        let user;

        if (req.query.code) {
            let oauth = new DiscordOauth2({
                clientId: config.botClientId,
                clientSecret: config.botClientSecret,
                redirectUri: 'https://modmail.xyz/premium'
            });

            let token;

            try {
                token = await oauth.tokenRequest({
                    code: req.query.code,
                    scope: ['identify'],
                    grantType: 'authorization_code'
                });
                token = token.access_token;
            } catch (err) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            user = await oauth.getUser(token);
        } else {
            let guild = bot.guilds.get(config.guild);
            let member = guild.members.find(element => element.user.id === req.query.id);

            if (!member) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            user = member.user;
        }

        res.json({
            id: user.id,
            username: user.username,
            discriminator: user.discriminator
        });
    });

    bot.app.get('/invite/:id', async (req, res) => {
        let id = hexToDec(req.params.id);
        let guild = bot.guilds.get(config.guild);
        let member = guild.members.get(id);

        if (!member) {
            res.redirect('https://modmail.xyz/invite');
            return;
        }

        let url = await axios.get('https://modmail.xyz/invite', {
            maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 400
        });
        url = `${url.headers.location}&state=${req.params.id}`;

        res.redirect(url);
    });

    bot.app.post('/invite/:id', async (req, res) => {
        if (!req.body.guild) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');

        res.json({ success: true });

        let id = hexToDec(req.params.id);
        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.botJoinLeave);
        let member = guild.members.get(id);

        if (!member) return;

        let invite = bot.db.prepare('SELECT * FROM invite WHERE guild=?').get(req.body.guild);

        if (invite) return;

        setTimeout(async () => {
            let message = channel.messages.find(element => {
                let embed = element.embeds[0];
                return embed.title === 'Server Join' && embed.description.includes(req.body.guild);
            });

            if (!message) return;

            bot.addCredit(member.user.id, config.rewards.invite);
            bot.db
                .prepare('INSERT OR IGNORE INTO invite VALUES (?, ?, ?, ?)')
                .run(req.body.guild, member.user.id, config.rewards.invite, Date.now());

            channel = guild.channels.get(config.channels.piggy);

            await channel.createMessage({
                content: `<@${member.user.id}>`,
                embed: {
                    title: 'Thank You for Inviting!',
                    description: `${config.rewards.invite} dollars have been added to the piggy bank.`,
                    color: config.colors.primary,
                    footer: {
                        text: 'Bot Invite'
                    },
                    timestamp: new Date().toISOString()
                }
            });
        }, 2000);
    });

    bot.app.get('/support/:id', async (req, res) => {
        let id = hexToDec(req.params.id);
        let guild = bot.guilds.get(config.guild);
        let member = guild.members.get(id);

        if (!member) {
            res.redirect('https://modmail.xyz/support');
            return;
        }

        res.redirect(
            bot.oauth.generateAuthUrl({
                scope: ['identify'],
                redirectUri: 'https://api.modmail.xyz/check/support',
                state: req.params.id
            })
        );
    });

    bot.app.get('/check/support', async (req, res) => {
        if (!req.query.code || !req.query.state) {
            res.redirect('https://modmail.xyz/support');
            return;
        }

        let id = hexToDec(req.query.state);
        let guild = bot.guilds.get(config.guild);
        let member = guild.members.get(id);

        if (!member) {
            res.redirect('https://modmail.xyz/support');
            return;
        }

        let token;

        try {
            token = await bot.oauth.tokenRequest({
                code: req.query.code,
                scope: ['identify'],
                grantType: 'authorization_code',
                redirectUri: 'https://api.modmail.xyz/check/support'
            });
            token = token.access_token;
        } catch (err) {
            res.redirect('https://modmail.xyz/support');
            return;
        }

        let user = await bot.oauth.getUser(token);

        bot.referrals[user.id] = member.user.id;

        res.redirect('https://modmail.xyz/support');

        setTimeout(async () => {
            delete bot.referrals[user.id];
        }, 300000);
    });

    bot.app.get('/check/github', async (req, res) => {
        if (!req.query.code) {
            res.redirect(
                bot.oauth.generateAuthUrl({
                    scope: ['identify', 'connections'],
                    redirectUri: 'https://api.modmail.xyz/check/github'
                })
            );
            return;
        }

        let token;

        try {
            token = await bot.oauth.tokenRequest({
                code: req.query.code,
                scope: ['identify', 'connections'],
                grantType: 'authorization_code',
                redirectUri: 'https://api.modmail.xyz/check/github'
            });
            token = token.access_token;
        } catch (err) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let user = await bot.oauth.getUser(token);
        let connections = await bot.oauth.getUserConnections(token);

        if (!bot.getTasks(user.id).includes('github')) {
            res.json({ error: 'Already Starred' });
            return;
        }

        let github = connections.find(element => element.type === 'github');

        if (!github) {
            res.json({ error: 'Missing GitHub Connection' });
            return;
        }

        let guild = bot.guilds.get(config.guild);
        let member = guild.members.get(user.id);

        if (!member) {
            res.json({ error: 'Member Not Found' });
            return;
        }

        let octokit = new Octokit({
            auth: config.githubToken
        });

        let stargazers = await octokit.paginate('GET /repos/:owner/:repo/stargazers', {
            owner: 'CHamburr',
            repo: 'modmail'
        });

        stargazers = stargazers.map(element => element.login.toLowerCase());

        if (!stargazers.includes(github.name.toLowerCase())) {
            res.json({ error: 'Not Starred' });
            return;
        }

        res.json({ success: true });

        bot.addTask(member.user.id, 'github', config.rewards.github);

        let channel = guild.channels.get(config.channels.piggy);

        await channel.createMessage({
            content: `<@${member.user.id}>`,
            embed: {
                title: 'Thank You for Starring!',
                description: `${config.rewards.github} dollars have been added to the piggy bank.`,
                color: config.colors.primary,
                footer: {
                    text: 'GitHub'
                },
                timestamp: new Date().toISOString()
            }
        });
    });

    bot.app.get('/check/review-bod', async (req, res) => {
        if (!req.query.id) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        if (!bot.getTasks(req.query.id).includes('review_bod')) {
            res.json({ error: 'Already Reviewed' });
            return;
        }

        let reviewed = await axios.get(`https://bots.ondiscord.xyz/bot-api/bots/${config.botId}/review`, {
            headers: {
                Authorization: config.express.bodToken
            },
            params: {
                owner: req.query.id
            }
        });

        if (!reviewed.data.exists) {
            res.json({ error: 'Review Not Found' });
            return;
        }

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.piggy);
        let member = guild.members.get(req.query.id);

        if (!member) {
            res.json({ error: 'Member Not Found' });
            return;
        }

        res.json({ success: true });

        bot.addTask(member.user.id, 'review_bod', config.rewards.review);

        await channel.createMessage({
            content: `<@${member.user.id}>`,
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
    });

    bot.app.post('/webhook/vote', async (req, res) => {
        let secret = req.header('Authorization');

        let user, type, name;

        if (secret === config.express.topggSecret) {
            user = req.body.user;
            type = 'vote_topgg';
            name = 'Top.gg';
        } else if (secret === config.express.dblSecret) {
            user = req.body.id;
            type = 'vote_dbl';
            name = 'Discord Bot List';
        } else if (secret === config.express.bfdSecret) {
            user = req.body.user;
            type = 'vote_bfd';
            name = 'Bots For Discord';
        } else if (secret === config.express.boatSecret) {
            user = req.body.user.id;
            type = 'vote_boat';
            name = 'Discord Boats';
        }

        if (!type) {
            res.status(400).json({ error: 'Bad Request' });
            return;
        }

        res.status(200).end();

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.piggy);
        let member = guild.members.get(user);

        if (!member) return;

        bot.addTask(member.user.id, type, config.rewards.vote);

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
    });

    bot.app.post('/webhook/payment', async (req, res) => {
        res.status(200).end();

        let query = 'cmd=_notify-validate&' + req.rawBody;
        let validity = await axios.post('https://ipnpb.paypal.com/cgi-bin/webscr', query);

        if (validity.data.toLowerCase() !== 'verified') return;
        if (req.body.receiver_email !== config.express.paypalEmail) return;

        let guild = bot.guilds.get(config.guild);
        let channel = guild.channels.get(config.channels.payment);
        let member = guild.members.get(req.body.custom);
        let user = member.user || await bot.getRESTUser(req.body.custom);
        
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
                color: config.colors.primary,
                timestamp: new Date().toISOString()
            }
        });
        
        if (!member) return;
        if (req.body.payment_status.toLowerCase() !== 'completed') return;
        if (req.body.mc_currency.toLowerCase() !== 'usd') return;

        if (parseInt(req.body.mc_gross) >= 90) {
            member.addRole(config.roles.premium5);
        } else if (parseInt(req.body.mc_gross) >= 60) {
            member.addRole(config.roles.premium3);
        } else if (parseInt(req.body.mc_gross) >= 30) {
            member.addRole(config.roles.premium1);
        } else {
            return;
        }

        channel = guild.channels.get(config.channels.patron);

        await channel.createMessage({
            content: `<@${member.user.id}>`,
            embed: {
                title: `Welcome, ${member.user.username}`,
                description: `Thank you for purchasing ${req.body.item_name}! <3`,
                color: config.colors.primary,
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

    bot.app.listen(config.express.port, async () => {
        console.log(`App ready on port ${config.express.port}!`);
    });
};
