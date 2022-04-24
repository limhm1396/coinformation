const { Sequelize } = require('sequelize');

const { config } = require('../config/config.js');

if (process.env.NODE_ENV === 'prd') {
    config.logging = false;
}

const sequelize = new Sequelize(config);

const Market = require('./markets');
const MarketHistory = require('./markets_history');
const SearchHistory = require('./search_history');

Market.init(sequelize);
MarketHistory.init(sequelize);
SearchHistory.init(sequelize);

// Relationship
Market.hasMany(MarketHistory, { foreignKey: 'market' });
MarketHistory.belongsTo(Market, { foreignKey: 'market', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

Market.hasMany(SearchHistory, { foreignKey: 'market_code' });
SearchHistory.belongsTo(Market, { foreignKey: 'market_code', onUpdate: 'CASCADE', onDelete: 'CASCADE', });

const db = {
    sequelize,
    Market,
    MarketHistory,
    SearchHistory,
}

module.exports = db;