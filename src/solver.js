/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');
const Q = require('q');
const redisClient = require('redis').createClient();


module.exports = {
	/**
	 * Метод, возвращающий минимум среди чисел набора, принадлежащих отрезку [left, right]
	 * @param left - левая граница отрезка поиска
	 * @param right - правая граница отрезка поиска
	 * @return минимум в множестве на отрезке [left, right]
	 */
	getMinimum: (left, right) => {
		left = +left;
		right = +right;
		const deferred = Q.defer();

		redisClient.get(`left=${left}&right=${right}`, (err, reply) => {
			if (err) {
				deferred.resolve(null);
			} else if (left > right || left > global.maxValue || right < global.minValue){
				deferred.resolve(null);
			} else if (reply) {
				deferred.resolve(reply);
			} else {

				const len = global.maxValue - global.minValue + 1;
				const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

				const firstFile = left >= global.minValue ?
					Math.floor((left - global.minValue) / step) + 1
					: 1;
				const lastFile = right <= global.maxValue ?
					Math.floor((right - global.minValue) / step) + 1
					: Math.floor((global.maxValue - global.minValue)/step) + 1;

				let result = null;

				try {
					let numbers;
					let min = right + 1;

					for (let i = firstFile; i <= lastFile; i++) {
						if (!fs.existsSync(path.join(dataDir, `part${i}.txt`)))
							continue;

						numbers = fs
							.readFileSync(path.join(dataDir, `part${i}.txt`), 'utf8')
							.split('\n')
							.map((number) => +number);

						for (let number of numbers) {
							if (number == left) {
								min = number;
								break;
							}

							if (number > left && number <= right && number < min) {
								min = number;
							}
						}

						if (min < right + 1) {
							result = min;
							break;
						}
					}

					redisClient.set(`left=${left}&right=${right}`, result);

					deferred.resolve(result);
				} catch(err) {
					deferred.resolve(null);
				}
			}
		});

		return deferred.promise;
	},

	/**
	 * Метод, добавляющий новое число в набор
	 * @param number
	 */
	addNumber: (number) => {
		if (number < global.minValue || number > global.maxValue) {
			return;
		}

		const len = global.maxValue - global.minValue + 1;
		const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

		const fileNumber = Math.floor((number - global.minValue) / step) + 1;

		try {
			let filePath = path.join(dataDir, `part${fileNumber}.txt`);

			fs.exists(filePath, (exists) => {
				if (exists) {
					fs.appendFile(filePath, '\n' + number, (err) => {
						if (err) throw err;
						redisClient.flushdb();
					});
				} else {
					fs.appendFile(filePath, number, (err) => {
						if (err) throw err;
						redisClient.flushdb();
					});
				}
			});
		} catch (err) {
			//console.error(err);
		}
	}
};