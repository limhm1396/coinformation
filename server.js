const pm2 = require('pm2');

const app = require('./app');

const { WebhookClient } = require('discord.js');
const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_SERVER_RESTART_BOT_URL });

const { sequelize } = require('./models');
const redis = require('./redis');

const PRD = 'prd';

// server start
(async () => {
  try {
    // db connect
    await sequelize.sync({ force: false, alter: false });
    console.log('DB start');
    if (process.env.NODE_ENV === PRD) {
      await webhook.send({ content: new Date().toISOString() + ' / DB start' });
    }

    // redis connect
    await redis.connect();
    console.log('redis start');
    if (process.env.NODE_ENV === PRD) {
      await webhook.send({ content: new Date().toISOString() + ' / redis start' });
    }

    // cron
    const cron = require('./cron');

    // port open
    const main_cache = await redis.get('GET:MARKETS');
    if (!main_cache) {
      // market update
      const Coin = require('./modules/coin');
      await Coin.updateAllMarketHistories();
    }

    app.listen(app.get('port'), async () => {
      console.log(app.get('port'), 'port server is running!');
      if (process.env.NODE_ENV === PRD) {
        await webhook.send({ content: new Date().toISOString() + ' / server start' });
      }
    });
  } catch (err) {
    console.log('ERROR');
    if (process.env.NODE_ENV === PRD) {
      await webhook.send({ content: new Date().toISOString() + ' / ERROR' });
      pm2.restart('server');
    }
  }
})();