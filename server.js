'use strict';

const express = require('express'),
  expressWs = require('express-ws'),
  redis = require('redis'),
  path = require('path'),
  logger = require('morgan');

const PORT = process.env.PORT || 8080,
  HOST = process.env.HOST_NAME || '0.0.0.0';

const redisClient = redis.createClient(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

const app = express();
expressWs(app);

/*
 * MIDDLEWARE
 */

//
app.use(logger(process.env.NODE_ENV || 'dev'));

// add redis client
app.use((req, res, next) => {
  req._redis = {};
  req._redis = redisClient;
  next();
});

/*
 * routes
 */

// http(s) & ws
app.get('/', (req, res) => (
  res.send("Hello World\n")
));

const routes = require('./routes/translate');
app.use('/translate', routes);

// handle 404s
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// remove stack info for non-dev environments
// if (app.get('env') === 'development') {
//   app.use((err, req, res, next) => {
//     res.status(err.status || 500);
//     res.render('error', { message: err.message, error: err });
//   });
// } else {
//   app.use((err, req, res, next) => {
//     res.status(err.status || 500);
//     res.render('error', { message: err.message, error: {} });
//   });
// }

app.listen(PORT, HOST);
console.log(`Node server start @ ${HOST}:${PORT}`);
