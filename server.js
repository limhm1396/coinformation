const { WebhookClient } = require('discord.js');

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
        new WebhookClient({ url: process.env.DISCORD_WEBHOOK_SERVER_RESTART_BOT_URL })
            .send({ content: 'Server Start' });
        console.log(app.get('port'), 'port server is running!');
    });
})();