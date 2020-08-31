const config = require('../config.js');

module.exports = [
    {
        level: 0,
        check: () => {
            return true;
        }
    },
    {
        level: 9,
        check: message => {
            return config.admins.include(message.author.id);
        }
    },
    {
        level: 10,
        check: message => {
            return config.owners.include(message.author.id);
        }
    }
];
