const { Sequelize } = require('sequelize');

const { config } = require('../config/config.js');

const sequelize = new Sequelize(config);

const db = {}

db.sequelize = sequelize;

module.exports = db;