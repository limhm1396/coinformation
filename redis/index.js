const { createClient } = require('redis');

const options = {};
if (process.env.NODE_ENV === 'prd') {
    options.url = `redis://${process.env.REDIS_HOST}`;
}

const client = createClient(options);

client.on('error', (err) => console.log('Redis Client Error', err));

module.exports = client;