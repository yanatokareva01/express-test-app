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
				deferred.reject(err);
			} else if (left > right || left > global.maxValue || right < global.minValue){
				deferred.reject();
			} else if (reply) {
				deferred.resolve(reply);
			} else {
				let result = global.segmentTree.rmq(left, right);
				if (result == Infinity) {
					deferred.resolve(null);
				} else {
					deferred.resolve(result);
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