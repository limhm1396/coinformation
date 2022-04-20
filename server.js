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

// listening
app.listen(app.get('port'), () => {
    console.log(app.get('port'), 'port server is running!');
});