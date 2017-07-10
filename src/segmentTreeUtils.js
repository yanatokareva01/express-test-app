"use strict";
const fs = require('fs');
const path = require('path');
const Q = require('q');
const dataDir = path.join(__dirname, '../data');
const childProcess = require('child_process');
const SegmentTree = require('./segmentTree');

function loadArrays() {
	let promises = [];
	for (let i = 1; i <= global.countOfParts; i++) {
		const deferred = Q.defer();
		const partPath = path.join(dataDir, `part${i}.txt`);
		fs.readFile(partPath, 'utf8', (err, result) => {
			if (err) {
				deferred.reject(err);
			} else {
				result = result.split('\n').map((number) => {
					return +number;
				});
				deferred.resolve(result);
			}
		});
		promises.push(deferred.promise);
	}

	return Q.all(promises);
}

function initSegmentTreeBuilder() {
	const segmentTreeBuilderPath = path.join(__dirname, '../background/segmentTreeBuilder.js');
	segmentTreeBuilder = childProcess.fork(segmentTreeBuilderPath, {
		execArgv: typeof v8debug === 'object' ? ['--debug'] : []
	});

	segmentTreeBuilder.on('message', (msg) => {
		if (typeof msg === 'object' && msg.hasOwnProperty('tree')) {
			isBuilding = false;
			segmentTree.tree = msg.tree;
			addedNumbers = tmpNumbers;
			tmpNumbers = [];
		}
	});
}

function findMinInAddedNumbers(left, right) {
	let numbers;
	isBuilding
		? numbers = tmpNumbers
		: numbers = addedNumbers;

	if (numbers.length === 0) {
		return null;
	}

	let l = 0,
		r = numbers.length - 1,
		mid,
		result;

	while (l <= r) {
		mid = (l + r) / 2 | 0;

		if (numbers[mid] < left) {
			l = mid + 1;
		} else if (numbers[mid] > left) {
			r = mid - 1;
		} else {
			result =  numbers[mid];
			break;
		}
	}

	if (!result) {
		result = (numbers[l]) >  left ? numbers[l] : numbers[r];
	}

	if (result > right || result < left) {
		return null;
	}

	return result;
}

let isBuilding = false;
let addedNumbers = [];
let tmpNumbers = [];
let segmentTreeBuilder;
let segmentTree = new SegmentTree();

module.exports = {

	init() {
		return loadArrays()
			.then((result) => {
				let numbers = [].concat.apply([], result);
				segmentTree.array = numbers;

				initSegmentTreeBuilder();
				segmentTreeBuilder.send({ numbers });
			});
	},

	getMinimum(left, right) {
		let minFromAddedNumbers = findMinInAddedNumbers(left, right);
		let minFromSegmentTree = segmentTree.rmq(left, right);

		if (minFromAddedNumbers) {
			return Math.min(minFromAddedNumbers, minFromSegmentTree);
		} else {
			return minFromSegmentTree;
		}
	},

	addNumber(number) {
		if (addedNumbers.length < 1000) {
			addedNumbers.forEach((item, i) => {
				if (item > number) {
					[addedNumbers[i], number] = [number, addedNumbers[i]];
				}
			});

			addedNumbers.push(number);
		} else if (isBuilding) {
			tmpNumbers.push(number);
		} else {
			isBuilding = true;

			addedNumbers.push(number);
			segmentTree.array = segmentTree.array.concat(addedNumbers);

			segmentTreeBuilder.send({
				numbers: segmentTree.array
			});
		}
	},

	clearAll() {
		segmentTree = new SegmentTree();
		addedNumbers = [];
		tmpNumbers = [];
	}
};