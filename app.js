const path = require('path');

// dotenv
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'prd') {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env_prd'),
  });
} else {
  dotenv.config({
    path: path.resolve(process.cwd(), '.env_local'),
  });
}

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');

const indexRouter = require('./routes/index');

const app = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
nunjucks.configure(app.set('views'), {
  watch: true,
  express: app,
});

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
redis.connect()
  .then(() => {
    console.log('Redis is running.');
  })
  .catch(() => {
    console.error('Redis is shutdown.');
  });

// cron
const cron = require('./cron');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
