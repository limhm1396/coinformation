const Coin = require('../modules/coin');

class Service {
    static getMdds = async (q='') => {
        const given_mdds = await Coin.getMarketsMDD();
        const mdds = [];

        if (q) {
            const regexp = new RegExp(`.*${q}.*`, 'i');
            given_mdds.forEach((mdd) => {
                const ticker = String(mdd.market);
                const korean_name = String(mdd.korean_name);
                const english_name = String(mdd.english_name);
                if (regexp.test(ticker) || regexp.test(korean_name) || regexp.test(english_name)) {
                    mdds.push(mdd);
                }
            });
        } else {
            mdds.push(...given_mdds);
        }
        return { mdds };
    }
}

module.exports = Service;