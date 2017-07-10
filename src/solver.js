/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');
const Q = require('q');
const redisClient = require('redis').createClient();
const Segment = require('../models/segment');

module.exports = {
	/**
	 * Метод, возвращающий минимум среди чисел набора, принадлежащих отрезку [left, right]
	 * @param left - левая граница отрезка поиска
	 * @param right - правая граница отрезка поиска
	 * @return минимум в множестве на отрезке [left, right]
	 */
	getMinimum: (left, right) => {
		const deferred = Q.defer();

		redisClient.get(`left=${left}&right=${right}`, (err, reply) => {
			if (reply) {
				deferred.resolve(reply);
			} else {
				const len = global.maxValue - global.minValue + 1;
				const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

				const firstPart = left >= global.minValue
					? Math.floor((left - global.minValue) / step) + 1
					: 1;
				const lastPart = right <= global.maxValue
					? Math.floor((right - global.minValue) / step) + 1
					: Math.floor((global.maxValue - global.minValue)/step) + 1;

				Segment.find({})
					.where('part').gte(firstPart).lte(lastPart)
					.sort('part')
					.then((documents) => {
						let min = right + 1;
						let result = null;

						for (let document of documents) {
							let numbers = document.numbers;

							for (let number of numbers) {
								if (number === left) {
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
					});
			}
		});

		return deferred.promise;
	},

	/**
	 * Метод, добавляющий новое число в набор
	 * @param number
	 */
	addNumber: (number) => {
		const len = global.maxValue - global.minValue + 1;
		const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

		const part = Math.floor((number - global.minValue) / step) + 1;

		return Segment.findOne({ part })
			.then((part) => {
				redisClient.flushdb();

				part.numbers.push(number);

				return part.save();
			});
	}
};