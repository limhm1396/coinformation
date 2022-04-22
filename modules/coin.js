const fetch = require('node-fetch');

const {
    sleep,
} = require('./time');
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
            await transaction.rollback();
        }
    }

    /**
     * @description DB에서 마켓 목록 가져오기
     * @returns {Array} markets
     */
    static getMarkets = async () => {
        return await Market.findAll();
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
     * @description CandleUrl class
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
     * @description 오늘 0시 0분 0초 Date 리턴
     * @returns Date
     */
    static initDate() {
        const date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    /**
     * @description 날짜 차이 리턴
     * @param {Date} start_dt 
     * @param {Date} end_dt 
     * @returns {Number} days 차이나는 일 수
     */
    static diffDays(start_dt, end_dt) {
        const diff = end_dt - start_dt;
        const temp = diff / (24 * 60 * 60 * 1000);
        return Math.floor(temp);
    }

    /**
     * @description 마켓 히스토리 업데이트
     * @param {String} market e.g. KRW-BTC
     */
    static updateMarketHistories = async (market) => {
        const latest_history = await MarketHistory.findOne({
            where: {
                market,
            },
            order: [['date', 'DESC']],
        });

        const url = UPBIT.UPBIT_MARKET_CANDLE_DAYS;
        const options = UPBIT.GET_OPTIONS;
        const date = this.initDate();

        const candleUrl = new this.CandleUrl(url, market, date.toISOString());

        if (latest_history) {
            const latest_date = new Date(latest_history.date);
            const diff_days = this.diffDays(latest_date, date);
            if (!diff_days) {
                return;
            }
            candleUrl.isFirstTime = false;
            candleUrl.count = diff_days;
        } else {
            candleUrl.isFirstTime = true;
        }

        const histories = [];
        let length = 0;
        do {
            await sleep(500);
            const res = await fetch(candleUrl.getUrl(), options);
            const json = await res.json();
            const data = Array.from(json);

            histories.push(...data);

            const end_dt = data[data.length - 1].candle_date_time_utc + 'Z';
            candleUrl.to = new Date(end_dt).toISOString();

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
            highest_price = latest_history.highest_price;
        }

        const transaction = await sequelize.transaction();
        try {
            for (let history of histories) {
                const date = new Date(history.candle_date_time_utc + 'Z');
                const trade_price = history.trade_price;
                highest_price = Math.max(history.high_price, highest_price);
                const mdd = this.getMdd(trade_price, highest_price);

                await MarketHistory.findOrCreate({
                    where: {
                        market,
                        date,
                    },
                    defaults: {
                        market,
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
            await transaction.rollback();
        }
    }

    static updateAllMarketHistories = async () => {
        await this.updateMarkets();
        const markets = await this.getMarkets();
        for (let market of markets) {
            const market_code = market.market;
            await this.updateMarketHistories(market_code);
        }
    }
}

module.exports = Coin;