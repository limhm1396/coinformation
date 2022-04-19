const { Market } = require('../models');

const Coin = require('../modules/coin');

class Service {
    static detail = async (marketCode) => {
        const market = await Market.findOne({
            where: {
                market: marketCode,
            }
        });
        const histories = await Coin.getMarketHistories(marketCode);
        histories.reverse();
        return { market, histories };
    }
}

module.exports = Service;