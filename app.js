const path = require('path');

const PRD = 'prd';

// dotenv
const dotenv = require('dotenv');
if (process.env.NODE_ENV === PRD) {
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('not_found');
});

// error handler
const { Log } = require('./models');
app.use(async function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);

  await Log.create({
    type: 'error',
    path: req.path,
    content: { message: err.message },
  });

  if (process.env.NODE_ENV === PRD) {
    const { WebhookClient } = require('discord.js');
    const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_SERVER_RESTART_BOT_URL });

    await webhook.send({ content: new Date().toISOString() + ` / ERROR_PATH: ${req.path}` });
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
