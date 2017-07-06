"use strict";
const fs = require('fs');
const path = require('path');
const Q = require('q');
const dataDir = path.join(__dirname, '../data');
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

class SegmentTree {
	makeTree(array) {
		let exponent = Math.log(array.length) / Math.log(2);
		let treeSize = -1;

		if (Math.pow(2, Math.floor(exponent)) === array.length) {
			treeSize = array.length * 2 - 1;
		} else {
			treeSize = Math.pow(2, Math.ceil(exponent)) * 2 - 1;
			let infinityCount = Math.ceil(treeSize / 2) - array.length;
			for (let i = 0; i < infinityCount; i++) {
				array.push(Infinity);
			}
		}

		let tree = new Array(treeSize);
		for (let i = 0; i < tree.length; i++) {
			tree[i] = {
				min: Infinity,
				l: Infinity,
				r: Infinity
			};
		}

		this.array = array;
		this.tree = tree;

		this.build(array, this.tree, 0, array.length - 1, 0);
	}

	build(array, tree, l, r, i) {
		if (l === r) {
			tree[i].l = array[l];
			tree[i].r = array[l];
			tree[i].min = array[l];
			return;
		}

		let mid = Math.floor((l + r) / 2);

		this.build(array, tree, l, mid, i * 2 + 1);
		this.build(array, tree, mid + 1, r, i * 2 + 2);

		tree[i].l = Math.min(tree[i*2 + 1].l, tree[i*2 + 2].l);
		tree[i].r = Math.max(tree[i*2 + 1].r, tree[i*2 + 2].r);
		tree[i].min = Math.min(tree[i * 2 + 1].min, tree[i * 2 + 2].min);
	}

	rmq(l, r) {
		return this.rangeMinQuery(this.tree, l, r, 0);
	}

	rangeMinQuery(tree, ql, qr, i) {
		if (ql <= this.tree[i].l && qr >= this.tree[i].r) {
			return tree[i].min;
		}
		if (this.tree[i].l > qr || this.tree[i].r < ql) {
			return Infinity;
		}

		return (Math.min(
			this.rangeMinQuery(tree, ql, qr, i * 2 + 1),
			this.rangeMinQuery(tree, ql, qr, i * 2 + 2)
		));
	}
}

let segmentTree = new SegmentTree();
let addedNumbers = [];

module.exports = {

	init: function() {
		loadArrays()
			.then((result) => {
				let merged = [].concat.apply([], result);
				segmentTree.makeTree(merged);
			})
			.catch((err) => {
			// TODO: catch it
				console.log(err);
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
			let tmp;
			addedNumbers.forEach((item, i) => {
				if (item > number) {
					tmp = item;
					addedNumbers[i] = number;
					number = tmp;
				}
			});
			addedNumbers.push(number);
		} else {
			segmentTree.array = segmentTree.array.concat(addedNumbers);
			segmentTree.makeTree(segmentTree.array);
			addedNumbers = [];
		}
	},

	clearAll: () => {
		segmentTree = new SegmentTree();
		addedNumbers = [];
	}
};