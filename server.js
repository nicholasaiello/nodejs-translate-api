'use strict';

const express = require('express'),
	path = require('path'),
	logger = require('morgan');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST_NAME || '0.0.0.0';

let routes = require('./routes/translate');

const app = express();

app.use(logger(process.env.NODE_ENV || 'dev'));
app.get('/', (req, res) => (
	res.send("Hello World\n")
))

app.use('/translate', routes);

// handle 404s
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// remove stack info for non-dev environments
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: err });
  });
} else {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', { message: err.message, error: {} });
  });
}

app.listen(PORT, HOST);
console.log(`Node server start @ ${HOST}:${PORT}`);
