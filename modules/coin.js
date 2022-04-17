const fetch = require('node-fetch');

const redis = require('../redis');
const { getTTL } = require('./time');

const UPBIT = require('../common/upbit');

const { Market } = require('../models');

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
    static postMarkets = async () => {
        const coins = await this.getKrwMarketsFromUpbit(); // 밑에 for문에서 변수명이 겹치지 않기 위해 이렇게 만듬.

        for (let coin of coins) {
            const market = String(coin.market);
            const ticker = market.slice(4);
            const korean_name = String(coin.korean_name);
            const english_name = String(coin.english_name);

            await Market.findOrCreate({
                where: {
                    market,
                },
                defaults: {
                    market,
                    ticker,
                    korean_name,
                    english_name,
                },
            });
        }
    }

    /**
     * @description DB에서 마켓 목록 가져오기
     * @returns {Array} markets
     */
    static getMarkets = async () => {
        const markets = await redis.get('markets');

        if (!markets) {
            await this.postMarkets();

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

                const korean_name = market.korean_name;
                const english_name = market.english_name;
                const current_price = Number(info.trade_price);
                const highest_price = Number(info.highest_52_week_price);

                // 최대낙폭지수 퍼센트 공식: (현재가 - 최고가) / 최고가 * 100
                const mdd = ((current_price - highest_price) / highest_price * 100).toFixed(2);

                market_mdds.push({
                    market: market.market,
                    korean_name,
                    english_name,
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
}

module.exports = Coin;