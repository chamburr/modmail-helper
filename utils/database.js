module.exports = async bot => {
    let config = bot.config;

    bot.db
        .prepare(
            `CREATE TABLE IF NOT EXISTS user
            (
                id      text    NOT NULL PRIMARY KEY,
                credit  integer NOT NULL,
                created integer NOT NULL
            )`
        )
        .run();

    bot.db
        .prepare(
            `CREATE TABLE IF NOT EXISTS task
            (
                user    text    NOT NULL,
                type    text    NOT NULL,
                reward  integer NOT NULL,
                created integer NOT NULL
            )`
        )
        .run();

    bot.db
        .prepare(
            `CREATE TABLE IF NOT EXISTS invite
            (
                guild    text    NOT NULL PRIMARY KEY,
                referrer text    NOT NULL,
                reward   integer NOT NULL,
                created  integer NOT NULL
            )`
        )
        .run();

    bot.db
        .prepare(
            `CREATE TABLE IF NOT EXISTS server
            (
                user     text    NOT NULL PRIMARY KEY,
                referrer text    NOT NULL,
                reward   integer NOT NULL,
                created  integer NOT NULL
            )`
        )
        .run();

    bot.getUser = id => {
        let user = bot.db.prepare('SELECT * FROM user WHERE id=?').get(id);
        if (!user) {
            bot.db.prepare('INSERT INTO user VALUES (?, ?, ?)').run(id, 0, Date.now());
            return bot.getUser(id);
        }
        return user;
    };

    bot.addCredit = (id, amount) => {
        let user = bot.getUser(id);
        let credit = user.credit + amount;
        bot.db.prepare('UPDATE user SET credit=? WHERE id=?').run(credit, id);
    };

    bot.addTask = (id, task, amount) => {
        bot.addCredit(id, amount);
        bot.db.prepare('INSERT INTO task VALUES (?, ?, ?, ?)').run(id, task, amount, Date.now());
    };

    bot.getTasks = id => {
        let tasks = ['daily', 'weekly', 'github', 'review_bod', 'vote_topgg', 'vote_dbl', 'vote_bfd', 'vote_boat'];
        let invites = config.limits.invite;
        let servers = config.limits.server;

        bot.getUser(id);
        let task = bot.db.prepare('SELECT * FROM task WHERE user=?').all(id);
        let invite = bot.db.prepare('SELECT * FROM invite WHERE referrer=?').all(id);
        let server = bot.db.prepare('SELECT * FROM server WHERE referrer=?').all(id);

        let dayMs = 86400000;
        let epochMn = Date.now() - (Date.now() % dayMs);

        for (let element of task) {
            let duration = Date.now() - element.created;

            if (
                element.type === 'github' ||
                element.type === 'review_bod' ||
                (element.type === 'daily' && duration <= dayMs) ||
                (element.type === 'weekly' && duration <= 7 * dayMs) ||
                (element.type === 'vote_topgg' && duration <= 0.5 * dayMs) ||
                (element.type === 'vote_dbl' && duration <= dayMs) ||
                (element.type === 'vote_bfd' && element.created >= epochMn) ||
                (element.type === 'vote_boat' && duration <= 0.5 * dayMs)
            ) {
                let index = tasks.indexOf(element.type);
                if (index !== -1) tasks.splice(index, 1);
            }
        }

        for (let element of invite) {
            if (element.created >= epochMn) {
                invites -= 1;
            }
        }

        for (let element of server) {
            if (element.created >= epochMn) {
                servers -= 1;
            }
        }

        if (config.owners.includes(id)) {
            let index = tasks.indexOf('review_bod');
            if (index !== -1) tasks.splice(index, 1);
        }

        if (invites < 0) invites = 0;
        if (servers < 0) servers = 0;

        tasks.push(...new Array(invites).fill('invite'));
        tasks.push(...new Array(servers).fill('server'));

        return tasks;
    };
};
