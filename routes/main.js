const Service = require('../services');

class Route {
    static getMain = async (req, res, next) => {
        const { q, o, m } = req.query;

        if (q) {
            const result = await Service.getSeachMarkets(q);
            return res.render('index', result);
        } else if (o) {
            const result = await Service.getOrderMarkets(o, m);
            return res.render('index', result);
        } else {
            const result = await Service.getMarkets();
            return res.render('index', result);
        }
    };

    static checkHealth = (req, res, next) => {
        return res.sendStatus(200);
    }
}

module.exports = Route;
