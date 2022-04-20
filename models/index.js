const { Sequelize } = require('sequelize');

const { config } = require('../config/config.js');

const sequelize = new Sequelize(config);

const Market = require('./markets');
const MarketHistory = require('./markets_history');
const SearchHistory = require('./search_history');

Market.init(sequelize);
MarketHistory.init(sequelize);
SearchHistory.init(sequelize);

// Relationship
Market.hasMany(SearchHistory, { foreignKey: 'market_code' });
SearchHistory.belongsTo(Market, { foreignKey: 'market_code', onUpdate: 'CASCADE', onDelete: 'CASCADE', });

const db = {
    sequelize,
    Market,
    MarketHistory,
    SearchHistory,
}

module.exports = db;