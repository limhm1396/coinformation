const Service = require('../services/statistic');

class Route {
  static getMain = (req, res, next) => {
    return res.render('statistic/index');
  };

  static getPopularSearch = (req, res, next) => {
    return res.render('statistic/search');
  };

  static getPopularSearchDetail = async (req, res, next) => {
    const result = await Service.getPopularSearchCoin();
    return res.send(result);
  };
}

module.exports = Route;