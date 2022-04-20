const express = require('express');

const router = express.Router();

const Service = require('../services/statistic');

router.get('/', (req, res, next) => {
    return res.render('statistic/index');
});

router.get('/popular/search', async (req, res, next) => {
    return res.render('statistic/search');
});

router.get('/popular/search/detail', async (req, res, next) => {
    const days = req.query.days;
    const result = await Service.getPopularSearchCoin(days);
    return res.send(result);
});

router

module.exports = router;