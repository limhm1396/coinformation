const express = require('express');

const router = express.Router();

const { errorHandler } = require('../handler');

const Main_Route = require('./main');
const Makret_Route = require('./market');
const Statistic_Route = require('./statistic');

// main
router.get('/', errorHandler(Main_Route.getMain));
router.get('/health', errorHandler(Main_Route.checkHealth));

// markets
router.get('/markets/:market', errorHandler(Makret_Route.getMarket));
router.get('/markets/:market/detail', errorHandler(Makret_Route.getMarketDetail));

// statistics
router.get('/statistics', errorHandler(Statistic_Route.getMain));
router.get('/statistics/popular/search', errorHandler(Statistic_Route.getPopularSearch));
router.get('/statistics/popular/search/detail', errorHandler(Statistic_Route.getPopularSearchDetail));

module.exports = router;
