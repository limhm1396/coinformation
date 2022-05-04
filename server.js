const app = require('./app');

const { WebhookClient } = require('discord.js');
const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_SERVER_RESTART_BOT_URL });

const { sequelize } = require('./models');
const redis = require('./redis');

// server start
(async () => {
  // db connect
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log('DB start');
    await webhook.send({ content: new Date().toISOString() + ' / DB start' });
  } catch (err) {
    console.log('DB error');
    await webhook.send({ content: new Date().toISOString() + ' / DB error' });
  }

  // redis connect
  try {
    await redis.connect();
    console.log('redis start');
    await webhook.send({ content: new Date().toISOString() + ' / redis start' });
  } catch (err) {
    console.log('redis error');
    await webhook.send({ content: new Date().toISOString() + ' / redis error' });
  }

  // cron
  const cron = require('./cron');

  // port open
  try {
    const main_cache = await redis.get('GET:MARKETS');
    if (!main_cache) {
      // market update
      const Coin = require('./modules/coin');
      await Coin.updateAllMarketHistories();
    }

    app.listen(app.get('port'), async () => {
      console.log(app.get('port'), 'port server is running!');
      await webhook.send({ content: new Date().toISOString() + ' / server start' });
    });
  } catch (err) {
    console.log('server error');
    await webhook.send({ content: new Date().toISOString() + ' / server error' });
  }
})();