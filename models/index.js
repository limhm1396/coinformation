const { Sequelize } = require('sequelize');

const { config } = require('../config/config.js');

const sequelize = new Sequelize(config);

const Market = require('./markets');

Market.init(sequelize);

const db = {
    sequelize,
    Market,
}

module.exports = db;