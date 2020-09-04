module.exports = async bot => {
    let config = bot.config;

    bot.db
        .prepare(
            `CREATE TABLE IF NOT EXISTS user
            (
                id      text    NOT NULL PRIMARY KEY,
                credit  integer NOT NULL,
                created text    NOT NULL
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
                created text    NOT NULL
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
                created  text    NOT NULL
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
                created  text    NOT NULL
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

    bot.getTasks = id => {
        let tasks = ['daily', 'weekly', 'github', 'review_bod', 'vote_topgg', 'vote_dbl', 'vote_bfd', 'vote_boat'];
        let invites = config.limits.invite;
        let refers = config.limits.refers;

        let completed = bot.db.prepare('SELECT * FROM task WHERE user=?').all(id);

        for (let element of completed) {
            let duration = Date.now() - element.created;
            let dayMs = 86400000;
            let epochMn = Date.now() - (Date.now() % dayMs);

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
            } else if (element.type === 'invite' && element.created >= epochMn) {
                invites -= 1;
            } else if (element.type === 'refer' && element.created >= epochMn) {
                refers -= 1;
            }
        }

        if (invites < 0) invites = 0;
        if (refers < 0) refers = 0;

        tasks.push(...Array.from(invites).fill('invite'));
        tasks.push(...Array.from(refers).fill('refer'));

        return tasks;
    };

    bot.getTotal = () => {
        return bot.db.prepare('SELECT SUM(credit) as total FROM user').get().total;
    };
};
