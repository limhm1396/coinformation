const redis = require('../redis');
const { Op } = require('sequelize');

const Coin = require('../modules/coin');
const { getTTL } = require('../modules/time');

const {
    Market,
    MarketHistory,
} = require('../models');

class Service {
    static getMarkets = async () => {
        const mdds = await redis.get('GET_MARKETS');

        if (!mdds) {
            await Coin.updateAllMarketHistories();

            const mdds = [];
            const date = new Date();
            date.setDate(date.getDate() - 1);
            const markets = await Market.findAll({
                include: {
                    model: MarketHistory,
                    where: {
                        date,
                    },
                },
            });

            markets.forEach((market) => {
                mdds.push(this.getMarketObj(market));
            });


            await redis.set('GET_MARKETS', JSON.stringify(mdds), {
                EX: getTTL(),
            });

            return { mdds }
        }

        return { mdds: JSON.parse(mdds) };
    };

    static getSeachMarkets = async (q) => {
        const mdds = [];
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const markets = await Market.findAll({
            where: {
                [Op.or]: {
                    ticker: {
                        [Op.like]: `%${q}%`,
                    },
                    korean_name: {
                        [Op.like]: `%${q}%`,
                    },
                    english_name: {
                        [Op.like]: `%${q}%`,
                    },
                }
            },
            include: {
                model: MarketHistory,
                where: {
                    date,
                },
            },
        });

        markets.forEach((market) => {
            mdds.push(this.getMarketObj(market));
        });

        return { mdds };
    };

    static getOrderMarkets = async (o, m) => {
        let order;
        switch (o) {
            case 'nm':
                order = 'korean_name';
                break;
            case 'hp':
                order = 'highest_price';
                break;
            case 'tp':
                order = 'trade_price';
                break;
            case 'mdd':
                order = 'mdd';
                break;
            default:
                order = 'ticker';
        }

        let method;
        switch (m) {
            case 'DESC':
                method = 'DESC';
                break;
            case 'ASC':
                method = 'ASC';
                break;
            default:
                method = 'ASC';
        }

        const mdds = [];
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const find_options = {
            include: {
                model: MarketHistory,
                where: {
                    date,
                },
            },
            order: [[MarketHistory, order, method]],
        }
        if (o === 'nm' || order === 'ticker') {
            find_options.order = [[order, method]];
        }

        const markets = await Market.findAll(find_options);

        markets.forEach((market) => {
            mdds.push(this.getMarketObj(market));
        });

        return { mdds };
    };

    static getMarketObj(market) {
        const market_code = market.market;
        const ticker = market.ticker;
        const korean_name = market.korean_name;
        const english_name = market.english_name;

        const history = market.markets_histories[0];
        const trade_price = Number(history.trade_price);
        const highest_price = Number(history.highest_price);
        const mdd = history.mdd;

        const obj = {
            market_code,
            ticker,
            korean_name,
            english_name,
            trade_price: trade_price.toLocaleString('ko-kr'),
            highest_price: highest_price.toLocaleString('ko-kr'),
            mdd,
        }

        return obj;
    }
}

module.exports = Service;