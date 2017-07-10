/**
 * Created by creed on 30.06.17.
 */
"use strict";

const path = require('path');
const Q = require('q');
const models = require('../models/segment');
const mongoose = require('mongoose');

module.exports = {
	generate: (initialSetSize, minValue, maxValue, countOfParts) => {
		const len = maxValue - minValue + 1;
		const step = Math.floor((len + countOfParts - 1) / countOfParts);

		const ranges = [];
		for(let i = minValue, part = 1; i < maxValue; i += step, part++) {
			ranges.push({
				left: i,
				right: i + step - 1
			});
		}

		const numbers = [];
		for(let i = 0; i < initialSetSize; i++) {
			const number = Math.random() * (maxValue - minValue + 1) + minValue;
			numbers.push(Math.floor(number)|0);
		}

		numbers.sort((a, b) => {
			if (+a < +b) {
				return -1;
			} else if (+a === +b) {
				return 0;
			}
			return 1;
		});
		const promises = [];
		// console.log(numbers);

		for(let i = 0, r = 0; i < numbers.length; i++) {
			if (numbers[i] > ranges[r].right) {
				r++;
			}
			promises.push(models[r].create({ number: numbers[i] }));
		}

		return Q.all(promises);
	},
	clear: () => {
		return mongoose.connection.dropDatabase();
	}
};