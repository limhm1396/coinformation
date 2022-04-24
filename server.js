const app = require('./app');

// server open
(async () => {
    const redis = require('./redis');
    const main_cache = await redis.get('GET:MARKETS');
    if (!main_cache) {
        // market update
        const Coin = require('./modules/coin');
        await Coin.updateAllMarketHistories();
    }

    app.listen(app.get('port'), () => {
        console.log(app.get('port'), 'port server is running!');
    });
})();