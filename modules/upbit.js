const fetch = require('node-fetch');

const { Market } = require('../models');

class Upbit {
    static getKrwMarketsFromUpbit = async () => {
        const url = 'https://api.upbit.com/v1/market/all?isDetails=false';
        const options = { method: 'GET', headers: { Accept: 'application/json' } };

        const res = await fetch(url, options);
        const coins = await res.json();

        return coins.reduce((result, coin) => {
            const market = String(coin.market);
            if (market.startsWith('KRW')) {
                result.push(coin);
            }
            return result;
        }, []);
    };

    static postMarkets = async (coins) => {
        for (let coin of coins) {
            const market = String(coin.market);
            const korean_name = String(coin.korean_name);
            const english_name = String(coin.english_name);

            await Market.findOrCreate({
                where: {
                    market,
                },
                defaults: {
                    market,
                    korean_name,
                    english_name,
                },
            });
        }
    }

    static getMarkets = async () => {
        const makrets = await Market.findAll();
        return makrets;
    }

    static getMarketsCode = (markets) => {
        return markets.reduce((result, market) => {
            const code = String(market.market);
            result.push(code);
            return result;
        }, []);
    }

    static getMarketsInfoFromUpbit = async (markets) => {
        if (!markets) {
            markets = await this.getKrwMarketsFromUpbit();
        }
    
        const base_url = 'https://api.upbit.com/v1/ticker?markets=';
        const options = { method: 'GET', headers: { Accept: 'application/json' } };
    
        const codes = this.getMarketsCode(markets);
        const full_url = base_url + String(codes);
    
        const res = await fetch(full_url, options);
        const infos = await res.json();
    
        return infos;
    }

    static getMarketsMDD = async (infos) => {
        if (!infos) {
            infos = await this.getMarketsInfoFromUpbit();
        }
    
        // 최대낙폭지수 퍼센트 공식: (현재가 - 최고가) / 최고가 * 100
        return infos.reduce((result, info) => {
            const market = String(info.market);
            const current_price = Number(info.trade_price);
            const highest_price = Number(info.highest_52_week_price);
    
            const mdd = ((current_price - highest_price) / highest_price * 100).toFixed(2);
    
            result.push({
                market,
                mdd,
            });
    
            return result;
        }, []);
    }
}

module.exports = Upbit;