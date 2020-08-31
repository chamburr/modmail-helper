const config = require('../config.js');

module.exports = [
    {
        level: 0,
        check: function () {
            return true;
        }
    },
    {
        level: 9,
        check: function (message) {
            return config.admins.include(message.author.id);
        }
    },
    {
        level: 10,
        check: function (message) {
            return config.owners.include(message.author.id);
        }
    }
];
