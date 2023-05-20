const { Sequelize } = require('sequelize')
require('dotenv').config();

module.exports = new Sequelize(
    'db',
    'root',
    'root',
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
    }
)