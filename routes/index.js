const express = require('express');

const router = express.Router();

const { Market } = require('../models');

const Coin = require('../modules/coin');

/* GET home page. */
router.get('/', async (req, res, next) => {
  const mdds = await Coin.getMarketsMDD();
  return res.render('index', { mdds });
});

router.get('/:market', async (req, res, next) => {
  const marketCode = req.params.market;
  const market = await Market.findOne({
    where: {
      market: marketCode,
    }
  });
  const histories = await Coin.getMarketHistories(marketCode);
  return res.render('detail', { market, histories });
})

module.exports = router;
