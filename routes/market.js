const express = require('express');

const router = express.Router();

const Service = require('../services/market');

router.get('/:market', async (req, res, next) => {
  return res.render('detail');
});

router.get('/:market/detail', async (req, res, next) => {
  const marketCode = req.params.market;
  const result = await Service.detail(marketCode);
  return res.send(result);
});

module.exports = router;
