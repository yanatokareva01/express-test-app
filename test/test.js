const request = require('request');
const fs = require('fs');
const path = require('path');
const Q = require('q');

// TODO: сделать изменяемыми
const intervalsFile = path.join(__dirname, 'intervals.txt');
const requestsNumber = process.env.requestsNumber || 1000;
const min = process.env.min || 1;
const max = process.env.max || 1e9;
const port = process.env.PORT || 3000;
const appUrl = 'http://localhost:' + port;
const logFile = process.env.logFile || 'log.txt';
const logger = require('./logger')(path.join(__dirname, logFile));

if (module.parent) {
	module.exports = test;
} else {
	test();
}

function test() {
	logger.info('Начинаем тестирование');
	generateTestCoverage()
		.then(sendRequests)
		.then(processRequestsTime)
		.catch((err) => {
			logger.warn(err);
		});
}

function generateTestCoverage() {
	logger.info('Генерируем тестовые интервалы. Смотри файл intervals.txt');
	let intervals = [];
	for (let i = 0; i < requestsNumber; i++) {
		let a = Math.floor(Math.random() * (max - min + 1)) + min;
		let b = Math.floor(Math.random() * (max - min + 1)) + min;
		if (a > b) {
			let tmp = a;
			a = b;
			b = tmp;
		}
		intervals.push(`${a} ${b}`);
	}

	const deferred = Q.defer();

	fs.writeFile(path.join(__dirname, 'intervals.txt'), intervals.join('\n'), (err, result) => {
		if (err) {
			deferred.reject(err);
		}
		deferred.resolve(result);
	});

	return deferred.promise;
}

function sendRequests() {
	const outerDeferred = Q.defer();
	fs.readFile(intervalsFile, 'utf-8', (err, result) => {
		if (err) {
			outerDeferred.reject();
		} else {
			result = result.split('\n');

			logger.info('Генерируем GET запросы');
			let promises = [];
			for (let i = 0; i < requestsNumber * 0.99; i++) {
				let interval = result[i].split(' ');

				const deferred = Q.defer();
				request(appUrl, {
					time: true,
					qs: {
						left: interval[0],
						right: interval[1]
					}
				}, (err, res) => {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res.timingPhases.firstByte);
					}
				});
				promises.push(deferred.promise);
			}

			logger.info('Генерируем POST запросы');
			for (let i = 0; i < requestsNumber * 0.01; i++) {
				const deferred = Q.defer();
				request.post({
					url: appUrl,
					time: true,
					json: {number: Math.floor(Math.random() * (max - min + 1)) + min}
				}, (err, res) => {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res.timingPhases.firstByte);
					}
				});
				promises.push(deferred.promise);
			}

			outerDeferred.resolve(promises);
		}
	});
	return outerDeferred.promise.then((promises) => {
		return Q.all(promises);
	});
}

function processRequestsTime(times) {
	let time = times.reduce((sum, value) => { return sum + value; }, 0);
	logger.info('Время обработки первого GET запроса: ' + times[0]);
	logger.info('Время обработки последнего GET запроса: ' + times[requestsNumber * 0.99 - 1]);

	logger.info('Время обработки первого POST запроса: ' + times[requestsNumber * 0.99]);
	logger.info('Время обработки последнего POST запроса: ' + times[times.length - 1]);

	logger.info('Среднее время обработки запроса: ' + time / times.length);
}