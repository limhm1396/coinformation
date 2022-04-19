const express = require('express');

const router = express.Router();

const Market_Service = require('../services/market');

router.get('/:market', async (req, res, next) => {
  return res.render('detail');
});

router.get('/:market/detail', async (req, res, next) => {
  const marketCode = req.params.market;
  const result = await Market_Service.detail(marketCode);
  return res.send(result);
});

module.exports = router;
