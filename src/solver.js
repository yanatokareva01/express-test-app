/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');
const Q = require('q');
const utils = require('./utils');

module.exports = {
	/**
	 * Метод, возвращающий минимум среди чисел набора, принадлежащих отрезку [left, right]
	 * @param left - левая граница отрезка поиска
	 * @param right - правая граница отрезка поиска
	 * @return минимум в множестве на отрезке [left, right]
	 */
	getMinimum: (left, right) => {
		let result;
		if (left > right || left > global.maxValue || right < global.minValue){
			result = null;
		} else {
			result = utils.getMinimum(left, right);
		}
		return result;
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

			utils.addNumber(number);
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