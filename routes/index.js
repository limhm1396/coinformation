const express = require('express');

const router = express.Router();

const Coin = require('../modules/coin');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const mdds = await Coin.getMarketsMDD();
  return res.render('index', { mdds });
});

const marketRouter = require('./market');

router.use('/market', marketRouter);

module.exports = router;
