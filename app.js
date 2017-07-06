const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const segmentTreeUtils = require('./src/segmentTreeUtils');
const app = express();

/**
 * Основные параметры набора чисел
 */
global.initialSetSize = 1e6;
global.minValue = 1;
global.maxValue = 1e9;
global.countOfParts = 1e2;

/**
 * Инициализация исходного набора чисел (будет выполняться при каждом запуске сервера)
 * Если не нужно, можно убрать
 */
const generator = require('./src/generator');
generator.clear().then(() => {
  return generator.generate(
      global.initialSetSize,
      global.minValue,
      global.maxValue,
      global.countOfParts);
}).then(() => {
	segmentTreeUtils.init();
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
