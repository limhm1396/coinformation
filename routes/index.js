const express = require('express');

const router = express.Router();

const Coin = require('../modules/coin');

/* GET home page. */
router.get('/',  async (req, res, next) => {
  const mdds = await Coin.getMarketsMDD();
  return res.render('index', { mdds });
});

module.exports = router;
