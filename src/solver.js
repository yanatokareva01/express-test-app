/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');
const Q = require('q');
const redisClient = require('redis').createClient();
const utils = require('./utils');

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
					redisClient.set(`left=${left}&right=${right}`, null);
					deferred.resolve(null);
				} else {
					redisClient.set(`left=${left}&right=${right}`, result);
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

		const numberAdded = (err) => {
			if (err) throw err;

			redisClient.keys("*", (err, keys) => {
				for (let key of keys) {
					let left = +key.match(/left=(\d+)&/)[1];
					let right = +key.match(/right=(\d+)/)[1];
					if (number >= left && number <= right) {
						redisClient.del(key);
					}
				}
			});

			//utils.readArrayFromFiles().then((result) => {
			//	let merged = [].concat.apply([], result);

			//	global.segmentTree = new utils.SegmentTree(merged);
			//});
			let array = global.segmentTree.array;
			array.push(number);
			global.segmentTree = new utils.SegmentTree(array);
		};

		try {
			let filePath = path.join(dataDir, `part${fileNumber}.txt`);

			fs.exists(filePath, (exists) => {
				if (exists) {
					fs.appendFile(filePath, '\n' + number, numberAdded);
				} else {
					fs.appendFile(filePath, number, numberAdded);
				}
			});
		} catch (err) {
			//console.error(err);
		}
	}
};