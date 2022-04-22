const {
    Market,
    MarketHistory,
    SearchHistory,
} = require('../models');

class Service {
    static detail = async (marketCode, days = 30) => {
        const market = await Market.findOne({
            where: {
                market: marketCode,
            },
            include: {
                model: MarketHistory,
                order: [['date', 'desc']],
                limit: days,
            },
        });

        return { market };
    }

    static recordVisitor = async (who, market) => {
        const date = new Date();

        await SearchHistory.findOrCreate({
            where: {
                who,
                market_code: market,
                date,
            },
            defaults: {
                who,
                market_code: market,
            }
        });
    }
}

module.exports = Service;