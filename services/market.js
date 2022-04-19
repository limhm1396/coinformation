const { 
    Market,
    SearchHistory,
 } = require('../models');

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

    static recordVisitor = async (who, market) => {
        const dt = new Date();
        const date = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;

        await SearchHistory.findOrCreate({
            where: {
                who,
                market,
                date,
            },
            defaults: {
                who,
                market,
            }
        });
    }
}

module.exports = Service;