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
	let segmentTreeBuilderPath = path.join(__dirname, '../background/segmentTreeBuilder.js');
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

let addedNumbers = [];
let tmpNumbers = [];
let isBuilding = false;
let segmentTreeBuilder;
let segmentTree = new SegmentTree();

module.exports = {

	init: () => {
		return loadArrays()
			.then((result) => {
				let merged = [].concat.apply([], result);
				segmentTree.array = merged;

				initSegmentTreeBuilder();
				segmentTreeBuilder.send({
					numbers: merged
				});
			});
	},

	getMinimum: (left, right) => {
		let result;
		for (let i = 0; addedNumbers[i] <= right; i++) {
			if (addedNumbers[i] >= left) {
				result =  addedNumbers[i];
				break;
			}
		}

		return result !== undefined
			? Math.min(result, segmentTree.rmq(left, right))
			: segmentTree.rmq(left, right);
	},

	addNumber: (number) => {
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

	clearAll: () => {
		segmentTree = new SegmentTree();
		addedNumbers = [];
	}
};