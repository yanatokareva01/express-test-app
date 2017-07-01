/**
 * Created by creed on 30.06.17.
 */

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '../data');

module.exports = {
	/**
	 * Метод, возвращающий минимум среди чисел набора, принадлежащих отрезку [left, right]
	 * @param left - левая граница отрезка поиска
	 * @param right - правая граница отрезка поиска
	 * @return минимум в множестве на отрезке [left, right]
	 */
	getMinimum: (left, right) => {
		// your code goes here
		left = +left;
		right = +right;

		if (left > right || left > global.maxValue || right < global.minValue) {
			return null;
		}

		const len = global.maxValue - global.minValue + 1;
		const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

		const firstFile = left >= global.minValue ?
			Math.floor((left - global.minValue) / step) + 1
			: 1;
		const lastFile = right <= global.maxValue ?
			Math.floor((right - global.minValue) / step) + 1
			: Math.floor((global.maxValue - global.minValue)/step) + 1;

		try {
			let numbers;
			let min = right + 1;
			for (let i = firstFile; i <= lastFile; i++) {
				numbers = fs
					.readFileSync(path.join(dataDir, `part${i}.txt`), 'utf8')
					.split('\n')
					.map(function (number) { return +number});

				for (let number of numbers) {
					if (number == left) {
						return number;
					}

					if (number > left && number <= right && number < min) {
						min = number;
					}
				}

				if (min < right + 1) {
					return min;
				}
			}
		} catch(err) {
			return null;
		}

		return null;
	},

	/**
	 * Метод, добавляющий новое число в набор
	 * @param number
	 */
	addNumber: (number) => {
		// your code goes here
		if (number < global.minValue || number > global.maxValue) {
			return;
		}

		const len = global.maxValue - global.minValue + 1;
		const step = Math.floor((len + global.countOfParts - 1) / global.countOfParts);

		const fileNumber = Math.floor((number - global.minValue) / step) + 1;

		try {
			let filePath = path.join(dataDir, `part${fileNumber}.txt`);

			if (fs.existsSync(filePath)) {
				fs.appendFileSync(filePath, '\n' + number);
			} else {
				fs.appendFileSync(filePath, number);
			}
		} catch (err) {
			//console.error(err);
		}
	}
};