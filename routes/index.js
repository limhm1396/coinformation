const express = require('express');

const router = express.Router();

const Upbit = require('../modules/upbit');

/* GET home page. */
router.get('/',  async (req, res, next) => {
  const mdds = await Upbit.getMarketsMDD();
  return res.render('index', { mdds });
});

module.exports = router;
