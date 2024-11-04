const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('whatsapp', 'whatsapp', 'Wh@tsApi24', {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    timezone: '+01:00',
    dialectOptions: {
        timezone: 'Africa/Douala',
    }
});

module.exports = sequelize;