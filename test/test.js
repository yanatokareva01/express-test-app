const request = require('request');
const fs = require('fs');
const path = require('path');
const Q = require('q');

// TODO: сделать изменяемыми
const intervalsFile = path.join(__dirname, 'intervals.txt');
const requestsNumber = 1000;
const min = 1;
const max = 1e9;
const appUrl = 'http://localhost:3000';
const logger = require('./logger')(path.join(__dirname, 'log.txt'));

if (module.parent) {
	module.exports = test;
} else {
	test();
}

function test() {
	fs.exists(intervalsFile, (exists) => {
		logger.info('Начинаем тестирование');
		if (exists) {
			sendRequests()
				.then(processRequestsTime)
				.catch((err) => {
					logger.warn(err)
				})
		} else {
			generateTestCoverage()
				.then(sendRequests)
				.then(processRequestsTime)
				.catch((err) => {
					logger.warn(err);
				})
		}
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

			let promises = [];
			for (let i = 0; i < requestsNumber; i++) {
				let interval = result[i].split(' ');

				const deferred = Q.defer();
				request.get(appUrl, {
					time: true,
					qs: {
						left: interval[0],
						right: interval[1]
					}
				}, (err, res) => {
					if (err) {
						deferred.reject(err);
					} else {
						deferred.resolve(res.elapsedTime);
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
	logger.info('Среднее время запроса: ' + time / times.length);
}