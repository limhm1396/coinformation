const fetch = require('node-fetch');

const redis = require('../redis');
const { getTTL } = require('./time');
const { sequelize } = require('../models');

const UPBIT = require('../common/upbit');

const {
    Market,
    MarketHistory,
} = require('../models');

class Coin {
    /**
     * @description 업비트에서 마켓 목록 가져오기
     * @returns {Array} markets
     */
    static getKrwMarketsFromUpbit = async () => {
        const url = UPBIT.UPBIT_MARKET_CODE_LOOKUP;
        const options = UPBIT.GET_OPTIONS;

        const res = await fetch(url, options);
        const data = await res.json();
        const coins = Array.from(data); // 밑에 filter에서 변수명이 겹치지 않기 위해 이렇게 만듬.

        const markets = coins.filter((coin) => {
            const market = String(coin.market);
            return market.startsWith('KRW');
        });

        return markets;
    };

    /**
     * @description 업비트에서 가져온 마켓 목록 저장하기
     */
    static updateMarkets = async () => {
        const transaction = await sequelize.transaction();

        try {
            await Market.destroy({
                where: {},
                transaction,
            });

            const coins = await this.getKrwMarketsFromUpbit(); // 밑에 for문에서 변수명이 겹치지 않기 위해 이렇게 만듬.

            for (let coin of coins) {
                const market = String(coin.market);
                const ticker = market.slice(4);
                const korean_name = String(coin.korean_name);
                const english_name = String(coin.english_name);

                await Market.upsert({
                    market,
                    ticker,
                    korean_name,
                    english_name,
                    delete_at: null,
                }, {
                    transaction,
                });
            }

            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
        }
    }

    /**
     * @description DB에서 마켓 목록 가져오기
     * @returns {Array} markets
     */
    static getMarkets = async () => {
        const markets = await redis.get('markets');

        if (!markets) {
            await this.updateMarkets();

            const markets = await Market.findAll();

            await redis.set('markets', JSON.stringify(markets), {
                EX: getTTL(),
            })

            return markets;
        } else {
            return JSON.parse(markets);
        }
    }

    /**
     * @description markets[]에서 마켓코드만 추출해 Array로 반환하기
     * @param {Market[]} markets require
     * @returns {String[]} markets_code[]
     */
    static getMarketsCode = (markets) => {
        return markets.map((market) => {
            const code = String(market.market);
            return code;
        });
    }

    /**
     * @description 업비트에서 마켓 시세 정보 가져오기
     * @param {Market[]} markets
     * @returns {Array} infos
     */
    static getMarketsInfoFromUpbit = async (markets) => {
        if (!markets) {
            markets = await this.getMarkets();
        }

        const base_url = UPBIT.UPBIT_MARKET_CURRENT_INFO;
        const options = UPBIT.GET_OPTIONS;

        const codes = this.getMarketsCode(markets);
        const full_url = base_url + String(codes);

        const res = await fetch(full_url, options);
        const data = await res.json();
        const infos = Array.from(data);

        return infos;
    }

    /**
     * @description MDD 계산
     * @param {Number} price 현재가
     * @param {Number} h_price 최고가
     * @returns {String} mdd(최대 소숫점 2자리까지)
     */
    static getMdd = (price, h_price) => {
        // 최대낙폭지수 퍼센트 공식: (현재가 - 최고가) / 최고가 * 100
        return ((price - h_price) / h_price * 100).toFixed(2);
    }

    /**
     * @description 마켓 정보, 현 시세와 계산된 MDD 값이 포함된 Array 반환
     * @returns {Array} market_mdds
     */
    static getMarketsMDD = async () => {
        const market_mdds = await redis.get('markets_mdd');

        if (!market_mdds) {
            const infos = await this.getMarketsInfoFromUpbit();

            const market_mdds = [];
            for (let info of infos) {
                const market = await Market.findOne({
                    where: {
                        market: String(info.market),
                    }
                });

                const current_price = Number(info.trade_price);
                const highest_price = Number(info.highest_52_week_price);
                const mdd = this.getMdd(current_price, highest_price);

                market_mdds.push({
                    ticker: market.ticker,
                    market: market.market,
                    korean_name: market.korean_name,
                    english_name: market.english_name,
                    current_price: current_price.toLocaleString('ko-KR'),
                    highest_price: highest_price.toLocaleString('ko-KR'),
                    mdd,
                });
            }

            await redis.set('markets_mdd', JSON.stringify(market_mdds), {
                EX: 1,
            });

            return market_mdds;
        } else {
            return JSON.parse(market_mdds);
        }
    }

    /**
     * @description CandleUrl(생성자 함수)
     * @param {String} url 
     * @param {String} market 
     * @param {String} to 
     * @param {String} count
     */
    static CandleUrl = function (url = '', market = '', to = '') {
        this.url = url;
        this.market = market;
        this.to = to;
        this.count = 200;
        this.maxCount = this.count;

        this.getUrl = () => {
            return `${this.url}market=${this.market}&to=${this.to}&count=${this.count}`;
        }
    }

    /**
     * @description 마켓 히스토리 조회
     * @param {String} marketCode e.g. KRW-BTC
     * @param {Number} days 조회기간 e.g. 30
     * @returns {MarketHistory[]}
     */
    static getMarketHistories = async (marketCode, days = 30) => {
        await this.updateMarketHistories(marketCode);

        return await MarketHistory.findAll({
            where: {
                market: marketCode,
            },
            order: [['date', 'DESC']],
            limit: days,
        });
    }

    /**
     * @description 마켓 히스토리 업데이트
     * @param {String} marketCode e.g. KRW-BTC
     */
    static updateMarketHistories = async (marketCode) => {
        const history = await MarketHistory.findOne({
            where: {
                market: marketCode,
            },
            order: [['date', 'DESC']],
        });

        const url = UPBIT.UPBIT_MARKET_CANDLE_DAYS;
        const options = UPBIT.GET_OPTIONS;

        const date = new Date();
        date.setDate(date.getDate() - 1);

        const candleUrl = new this.CandleUrl(url, marketCode, date.toISOString());

        if (history) {
            candleUrl.isFirstTime = false;

            const latest_date = new Date(history.date);

            const diff = date - latest_date;
            const temp = diff / (24 * 60 * 60 * 1000);
            const count = Math.floor(temp);

            candleUrl.count = String(count);
        } else {
            candleUrl.isFirstTime = true;
        }

        const histories = [];
        let length = 0;
        do {
            const res = await fetch(candleUrl.getUrl(), options);
            const json = await res.json();
            const data = Array.from(json);

            histories.push(...data);

            const str_date = data[data.length - 1].candle_date_time_utc;
            const date = new Date(str_date)
            candleUrl.to = date.toISOString();

            length = data.length;

            if (!candleUrl.isFirstTime) {
                candleUrl.count -= length;
            }
        } while (length >= candleUrl.maxCount);

        histories.reverse(); // 가장 오래된 날짜부터 최고가 계산하기 위함.

        let highest_price;
        if (candleUrl.isFirstTime) {
            highest_price = 0;
        } else {
            highest_price = history.highest_price;
        }

        const transaction = await sequelize.transaction();
        try {
            for (let history of histories) {
                const date = new Date(history.candle_date_time_kst);
                const trade_price = history.trade_price;
                highest_price = Math.max(history.high_price, highest_price);
                const mdd = this.getMdd(trade_price, highest_price);

                await MarketHistory.findOrCreate({
                    where: {
                        market: marketCode,
                        date,
                    },
                    defaults: {
                        market: marketCode,
                        date,
                        trade_price,
                        highest_price,
                        mdd,
                    },
                    transaction,
                });
            }
            await transaction.commit();
        } catch (err) {
            console.log(err);
            await transaction.rollback();
        }
    }
}

module.exports = Coin;