module.exports = [
    {
        key: 'setup',
        name: 'Setting up the bot',
        match: /(?:just )?added (?:modmail|the bot|bot) to my server|how (?:do i|to) set ?up|set ?up (?:the )?(?:bot|modmail)|(?:modmail|bot) set ?up/i,
        title: 'Setting Up ModMail',
        description: 'Setting up only takes a minute.',
        fields: [
            {
                name: '1. Invite the bot',
                value: '[Invite ModMail](https://modmail.xyz/invite) to your server. If that link gives you trouble, use the raw invite link at the bottom.'
            },
            {
                name: '2. Run `=setup`',
                value: 'Run it in your server. You need the **Administrator** permission. The bot creates a **ModMail** category and a **#modmail-log** channel.'
            },
            {
                name: '3. Done! :tada:',
                value: 'Members can now DM the bot to open a ticket. Use `=help` or check the [command list](https://modmail.xyz/commands) for everything else.'
            },
            {
                name: 'Optional settings',
                value: '- `=accessrole <roles>`: which roles can see and reply to tickets\n- `=pingrole <roles>`: which roles get pinged when a ticket opens\n- `=anonymous`: hide the staff member\'s name on replies by default (this never hides the user)\n- `=logging [channel]`: post a message when tickets open or close (this is not a transcript)\n- `=commandonly`: make staff reply with `=reply` or `=areply` instead of just typing in the ticket\n- `=viewconfig`: see your current settings\n\nRoles can be mentions, IDs or names. Put names with spaces in quotes, like `"Head Admin"`.'
            },
            {
                name: 'Raw invite link',
                value: 'https://discord.com/oauth2/authorize?client_id=575252669443211264&permissions=268823640&response_type=code&redirect_uri=https%3A%2F%2Fmodmail.xyz%2Fwelcome&scope=bot+applications.commands'
            }
        ],
        related: ['permissions', 'premium']
    },
    {
        key: 'not-responding',
        name: 'Bot not responding',
        match: /(?:doesn'?t seem to be|isn'?t|not) working|(?:modmail|bot) (?:is )?(?:not|isn'?t) respond|doesn'?t (?:seem to work|respond)|not responding|no response/i,
        title: 'Bot Not Responding',
        description: 'This is almost always a permissions or prefix issue. Go through these in order:',
        fields: [
            {
                name: '1. Check the permissions',
                value: 'ModMail needs at least **View Channels**, **Send Messages and Create Posts** and **Embed Links** in the channel you are using it in. Channel and category settings can block these even if the role has them.'
            },
            {
                name: '2. Check the prefix',
                value: 'Mention the bot with `@ModMail prefix` to see the prefix for your server.'
            },
            {
                name: '3. Check the command',
                value: 'Use `=help <command>` to make sure the command exists and you are using it right.'
            },
            {
                name: '4. Check if the bot is up',
                value: 'Discord might be having issues, or the bot might be restarting. Keep an eye on our status updates.'
            },
            {
                name: 'Still not working?',
                value: 'Send us your [server ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) and we will take a look.'
            }
        ],
        related: ['permissions', 'outage']
    },
    {
        key: 'permissions',
        name: 'Permissions the bot needs',
        match: /permissions?|missing access|administrator/i,
        title: 'Permissions ModMail Needs',
        description: "Make sure ModMail's role has all of these in **Server Settings > Roles**. Channel and category settings can still take them away, so check those too if something only breaks in one place.",
        fields: [
            {
                name: 'Basics',
                value: '- View Channels\n- Send Messages and Create Posts\n- Read Message History\n- Embed Links\n- Attach Files\n- Add Reactions\n- Use External Emojis',
                inline: true
            },
            {
                name: 'Managing tickets',
                value: '- Manage Channels\n- Manage Roles\n- Manage Messages',
                inline: true
            },
            {
                name: 'Administrator',
                value: 'Optional. If the bot still does not work after checking everything above, giving it Administrator is a quick way to rule out permissions.'
            }
        ],
        related: ['not-responding']
    },
    {
        key: 'ticket-visibility',
        name: 'Everyone can see tickets',
        match: /every(?:one|body) can see|why can every(?:one|body) see|tickets? (?:are )?(?:public|visible)/i,
        title: 'Everyone Can See Tickets',
        description: 'This is usually another bot in your server changing the channel permissions, not ModMail. Check **Server Settings > Audit Log** to see which bot is editing them.',
        fields: [
            {
                name: 'Server wide permissions',
                value: 'Found in **Server Settings > Roles > @everyone**.\n- Turn **on** `Send Messages and Create Posts` and `Read Message History`.\n- Turn **off** `View Channels`, then allow it per channel (below).\n- `Connect`, `Speak`, `Embed Links`, `Change Nickname` and `Add Reactions` are optional. Some servers keep these for role rewards or boosters.'
            },
            {
                name: 'Channel and category permissions',
                value: 'Found in **Edit Channel > Permissions** (or Edit Category).\n- Give @everyone `View Channels` (green tick) on the channels and categories they should see.\n- Any other role that needs a channel also needs `View Channels` there.\n- If you have a muted role, set its `Send Messages and Create Posts` (and optionally `Add Reactions`) to the red cross.'
            },
            {
                name: 'Good to know',
                value: 'Members get permissions from all of their roles combined. If @everyone can view #general, no other role needs it there. If only your booster role can view a channel, only boosters will see it.'
            }
        ],
        related: ['permissions']
    },
    {
        key: 'open-ticket',
        name: 'Opening a ticket',
        match: /how (?:do i|to) (?:send a (?:message|msg) to|message|contact) (?:a|the) server|(?:create|open|make) (?:a )?ticket/i,
        title: 'Opening a Ticket',
        description: 'DM the bot and follow the prompts. That is the quickest way!',
        fields: [
            {
                name: 'Skip the server list',
                value: 'Use `=send <server ID> <message>` in the bot\'s DMs to message a server directly. You still need to be in that server, and ModMail needs to be in it too.'
            },
            {
                name: 'Bot keeps going to the wrong server?',
                value: 'If you turned on `=confirmation`, the bot asks to continue with the last server you messaged instead of showing the server list. Pick the option to switch, or use `=new <message>` to bring the server list back.'
            }
        ],
        related: ['dm-blocked', 'wrong-server']
    },
    {
        key: 'dm-blocked',
        name: 'Message could not be delivered',
        match: /could ?n[o']t be delivered|not delivered|only accepting d(?:irect message|m)s from friends|don'?t share a server|no (?:shared|mutual) servers?|\bclyde\b/i,
        title: 'Message Not Delivered',
        description: 'If you get **"your message could not be delivered"**, your privacy settings are blocking DMs from the server. Fix it with either option below, then try again.',
        fields: [
            {
                name: 'Just for one server',
                value: '1. Click the server name at the top of the channel list.\n2. Open **Privacy Settings**.\n3. Turn on **Direct Messages**.'
            },
            {
                name: 'For all servers',
                value: '1. Open **User Settings** (the cogwheel next to your username).\n2. Go to **Messaging Permissions > Direct Messages**.\n3. Make sure the dropdown says **All servers**.\n4. Turn on **Direct Messages** ("Allow DMs from other server members").'
            }
        ],
        related: ['open-ticket']
    },
    {
        key: 'wrong-server',
        name: 'Wrong server or banned',
        match: /\b(?:un)?ban(?:ned)?\b|appeal|racefactory|bloxburg|wrong server/i,
        title: 'Wrong Server',
        description: 'This server is for **ModMail bot** support only. We have no connection to other servers and cannot help with their issues, sorry.',
        fields: [
            {
                name: 'Trying to reach a server\'s staff?',
                value: 'DM <@575252669443211264> and pick **that** server from the list. Do **not** pick ModMail Support, or your message comes to us instead.'
            },
            {
                name: 'Banned from a server?',
                value: 'We cannot help with that. We have no affiliation with the server that banned you, and ModMail cannot be used to contact a server you are banned from.'
            }
        ],
        related: ['open-ticket']
    },
    {
        key: 'custom-instance',
        name: 'Custom instance',
        match: /custom (?:instance|bot)|private (?:instance|bot)|change (?:the )?bot'?s? (?:avatar|pfp|name|status)/i,
        title: 'Custom Instance',
        description: 'A custom instance is your own copy of ModMail with its own name and look. It costs **$60/year**. Contact <@381998065327931392> or <@365262543872327681> to get one.',
        fields: [
            {
                name: 'What you get',
                value: "- Your own username, avatar, status message and activity type\n- All the [premium features](https://modmail.xyz/premium)\n- No confirmation messages\n- Commands to open tickets with users\n- Requiring a command to send messages\n- Users' roles shown in New Ticket messages"
            }
        ],
        related: ['premium']
    },
    {
        key: 'selfhost',
        name: 'Self hosting and VPS',
        match: /self[ -]?host|source code|(?:bot|modmail)'?s? (?:source|repo)|github|\bvps\b|replit|heroku/i,
        title: 'Self Hosting ModMail',
        description: "We don't support self hosting, so we can't help if something breaks. If you still want to, the [Self-hosting guide](https://github.com/chamburr/modmail#self-hosting) runs the latest version with Docker Compose. It assumes you know your way around the command line, Docker and Discord bots.",
        fields: [
            {
                name: 'Older versions',
                value: 'Guides for older versions are [here](https://gist.github.com/waterflamev8/cab61e680e2fb5ea6027cbf144732925) and [here](https://github.com/chamburr/modmail/blob/v2.1.2/README.md#self-hosting).'
            },
            {
                name: 'Where to host',
                value: 'Any cheap VPS works:\n- [Hetzner](https://www.hetzner.com): EU, US\n- [OVHcloud](https://www.ovhcloud.com): EU, Canada\n- [Scaleway](https://www.scaleway.com): EU\n- [DigitalOcean](https://www.digitalocean.com): US, EU, Asia\n- [Linode](https://www.linode.com): US, EU, Asia\n- [Vultr](https://www.vultr.com): US, EU, Asia\n- [Time4VPS](https://www.time4vps.com): Lithuania',
                inline: true
            },
            {
                name: 'Hosting at home',
                value: 'An old computer with a few GB of RAM or a Raspberry Pi is enough.',
                inline: true
            },
            {
                name: 'Free hosting?',
                value: "No. Free hosts like Replit are underpowered, wipe saved files when the bot restarts, and share one IP between everyone, so someone else's banned bot can get yours banned too.\n\n**Kinda free:** GCP and AWS have one year free micros."
            }
        ]
    },
    {
        key: 'premium',
        name: 'Premium and logging',
        match: /premium|patron|snippets?|greeting message|closing message|advanced logging/i,
        title: 'ModMail Premium',
        description: 'Premium is a one-time purchase. It adds greeting and closing messages, advanced logging, snippets, priority support and access to exclusive channels here. [See all features](https://modmail.xyz/premium).',
        fields: [
            {
                name: 'Join this server before buying',
                value: 'Your tier gives you a role here (**Patron**, **Super Patron** or **Super Duper Patron**), and that role is what unlocks the premium commands. If you bought it before joining, let us know and we will add the role manually. This can take a few hours until an administrator is available.'
            },
            {
                name: 'Premium commands',
                value: '- `=premiumassign [server ID]`: give a server premium\n- `=premiumremove [server ID]`: take premium off a server\n- `=viewpremium`: see which servers have your premium\n- `=premiumstatus`: check the current server'
            },
            {
                name: 'Logging example',
                value: '[Here is an example](https://modmail.xyz/logs/d7586c153425000-10d1416086c01033-10d141608b802047) of what advanced logging looks like.'
            }
        ],
        image: 'https://media.discordapp.net/attachments/576765224460353589/929004300951253012/unknown.png',
        related: ['custom-instance']
    },
    {
        key: 'verify',
        name: "Can't verify on the website",
        match: /verif(?:y|ication|ied)|can'?t log ?in|login (?:link|page)/i,
        title: "Can't Verify?",
        description: 'Open the [verification link](https://modmail.xyz/login?redirect=/authorized) and log in with Discord. If it does not work, try these:',
        fields: [
            {
                name: '1. Check your account',
                value: 'Make sure your browser is logged into the **same** Discord account you use here. Go to <https://discord.com/login> and switch accounts if needed.'
            },
            {
                name: '2. Try a private window',
                value: 'Open the verification link in an incognito or private window. Yes, this works on mobile too.'
            }
        ],
        image: 'https://media.discordapp.net/attachments/576764484065165313/985238549886562374/unknown.png'
    },
    {
        key: 'outage',
        name: 'ModMail is having issues',
        match: /(?:modmail|the bot|bot) (?:is )?(?:down|offline)|outage|is it down|not sending my messages|can'?t find my servers?/i,
        title: 'ModMail Is Having Issues',
        description: "Thanks for letting us know. ModMail might be having issues right now, which can stop it from responding, sending your messages, or finding your servers.\n\nWe don't have an ETA. Any updates will be posted in the status channel.",
        status: true,
        related: ['not-responding']
    },
    {
        key: 'ask',
        name: 'Ask your question directly',
        match: /why won'?t anyone help|i need (?:support|help)|support me|help me|can (?:someone|anyone) help/i,
        title: "Don't just say `i need help`, tell us what you need help with!",
        description: "We can't help until we know what's wrong, so skip the hello and post your problem straight away. It saves all of us time and we can jump in with a solution.",
        fields: [
            {
                name: 'What to include',
                value: '- What you were trying to do\n- What happened instead (an error message or screenshot helps a lot)\n- Your [server ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) if it is about a specific server'
            }
        ]
    }
];
