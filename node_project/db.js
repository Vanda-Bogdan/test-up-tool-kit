const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
    'db',
    'root',
    'root',
    {
        host: '127.0.0.1',
        dialect: 'postgres',
    }
)