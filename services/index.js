const Coin = require('../modules/coin');

class Service {
    static getMdds = async (q = '') => {
        const given_mdds = await Coin.getMarketsMDD();

        if (q) {
            const search_mdds = this.searchMdds(given_mdds, q);
            return { mdds: search_mdds };
        }

        return { mdds: given_mdds };
    }

    static searchMdds = (mdds, q) => {
        const regexp = new RegExp(`.*${q}.*`, 'i');

        return mdds.reduce((result, mdd) => {
            const ticker = String(mdd.market);
            const ko_nm = String(mdd.korean_name);
            const en_nm = String(mdd.english_name);

            if (regexp.test(ticker) || regexp.test(ko_nm) || regexp.test(en_nm)) {
                result.push(mdd);
            }

            return result;
        }, []);
    }
}

module.exports = Service;