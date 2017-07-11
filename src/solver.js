/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');
const Q = require('q');
const models = require('../models/segment');

const len = global.maxValue - global.minValue + 1;
const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

module.exports = {
	/**
	 * Метод, возвращающий минимум среди чисел набора, принадлежащих отрезку [left, right]
	 * @param left - левая граница отрезка поиска
	 * @param right - правая граница отрезка поиска
	 * @return минимум в множестве на отрезке [left, right]
	 */
	getMinimum: (left, right) => {
		const firstPart = left >= global.minValue
			? Math.floor((left - global.minValue) / step) + 1
			: 1;
		const lastPart = right <= global.maxValue
			? Math.floor((right - global.minValue) / step) + 1
			: Math.floor((global.maxValue - global.minValue)/step) + 1;

		const functions = [];

		for (let i = firstPart; i <= lastPart; i++) {
			functions.push(() => {
				return models[i - 1]
					.find({})
					.where('number').gte(left).lte(right)
					.sort({number: 1})
					.then((results) => {
						if (results[0])
							throw results[0];
					});
			});
		}

		// читать коллекции друг за другом
		return functions.reduce(function (soFar, f) {
			return soFar.then(f);
		}, Q());
	},

	/**
	 * Метод, добавляющий новое число в набор
	 * @param number
	 */
	addNumber: (number) => {
		const part = Math.floor((number - global.minValue) / step);

		return models[part].create({ number });
	}
};