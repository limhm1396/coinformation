const express = require('express');

const router = express.Router();

const Service = require('../services');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const { q } = req.query;

  if (q) {
    const result = await Service.getSeachMarkets(q);
    return res.render('index', result);
  }
  
  const result = await Service.getMarkets();
  return res.render('index', result);
});

const marketRouter = require('./market');
const statisticRouter = require('./statistic');

router.use('/markets', marketRouter);
router.use('/statistics', statisticRouter);

module.exports = router;
