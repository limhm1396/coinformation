const Service = require('../services/market');

class Route {
  static getMarket = async (req, res, next) => {
    const marketCode = req.params.market;
    const who = req.ip;
    await Service.recordVisitor(who, marketCode);
    return res.render('detail');
  };

  static getMarketDetail = async (req, res, next) => {
    const marketCode = req.params.market;
    const result = await Service.detail(marketCode);
    return res.send(result);
  }
}

module.exports = Route;
