// dotenv
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

// sequelize
const { sequelize } = require('./models');
sequelize.sync({ force: false, alter: false })
    .then(() => {
        console.log('DB is running.');
    })
    .catch(() => {
        console.error('DB is shutdown.');
    });

// redis
const redis = require('./redis');
redis.connect();

// server open
(async () => {
    const main_cache = await redis.get('GET_MARKETS');
    if (!main_cache) {
        // market update
        const Coin = require('./modules/coin');
        await Coin.updateAllMarketHistories();
    }

    app.listen(app.get('port'), () => {
        console.log(app.get('port'), 'port server is running!');
    });
})();