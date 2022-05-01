const express = require('express');

const router = express.Router();

const Service = require('../services');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const { q, o, m } = req.query;

  if (q) {
    const result = await Service.getSeachMarkets(q);
    return res.render('index', result);
  } else if (o) {
    const result = await Service.getOrderMarkets(o, m);
    return res.render('index', result);
  } else {
    const result = await Service.getMarkets();
    return res.render('index', result);
  }
});

router.get('/health', (req, res) => {
  return res.sendStatus(200);
});

const marketRouter = require('./market');
const statisticRouter = require('./statistic');

router.use('/markets', marketRouter);
router.use('/statistics', statisticRouter);

module.exports = router;
