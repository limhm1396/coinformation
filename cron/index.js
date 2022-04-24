const cron = require('node-cron');

cron.schedule('5 0 * * *', async () => {
    const Coin = require('../modules/coin');
    await Coin.updateAllMarketHistories();
});