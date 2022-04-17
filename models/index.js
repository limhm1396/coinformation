const { Sequelize } = require('sequelize');

const { config } = require('../config/config.js');

const sequelize = new Sequelize(config);

const Market = require('./markets');
const MarketHistory = require('./markets_history');

Market.init(sequelize);
MarketHistory.init(sequelize);

const db = {
    sequelize,
    Market,
    MarketHistory,
}

module.exports = db;