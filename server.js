const app = require('./app');

// server open
const { sequelize } = require('./models');
const redis = require('./redis');
sequelize.sync({ force: false, alter: false })
  .then(() => {
    redis.connect()
      .then(async () => {
        // cron
        const cron = require('./cron');

        const main_cache = await redis.get('GET:MARKETS');
        if (!main_cache) {
          // market update
          const Coin = require('./modules/coin');
          await Coin.updateAllMarketHistories();
        }

        app.listen(app.get('port'), () => {
          const { WebhookClient } = require('discord.js');
          new WebhookClient({ url: process.env.DISCORD_WEBHOOK_SERVER_RESTART_BOT_URL })
            .send({ content: 'Server Start' });
          console.log(app.get('port'), 'port server is running!');
        });
      })
  }).catch(() => console.log('ERROR'));