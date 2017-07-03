const fs = require('fs');
const path = require('path');
const Q = require('q');
const dataDir = path.join(__dirname, '../data');

module.exports = {
	SegmentTree: class SegmentTree {
		constructor(array) {
			this.array = array;
			this.array.sort((a, b) => {
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			});
			this.tree = this.makeTree(array.length);
			this.build(this.array, this.tree, 0, array.length - 1, 0);
		}

		makeTree(n) {
			let exponent = Math.log(n) / Math.log(2);
			let treeSize = -1;

			if (Math.pow(2, Math.floor(exponent)) == n) {
				treeSize = n * 2 - 1;
			} else {
				treeSize = Math.pow(2, Math.ceil(exponent)) * 2 - 1;
			}

			let tree = Array(treeSize);
			tree.fill(Infinity);

			return tree;
		}

		build(array, tree, l, r, i) {
			if (l == r) {
				tree[i] = array[l];
				return;
			}

			let mid = Math.floor((l + r) / 2);

			this.build(array, tree, l, mid, i * 2 + 1);
			this.build(array, tree, mid + 1, r, i * 2 + 2);

			tree[i] = Math.min(tree[i * 2 + 1], tree[i * 2 + 2]);
		}

		rmq(l, r) {
			return this.rangeMinQuery(this.tree, l, r, 0, this.array.length - 1, 0);
		}

		rangeMinQuery(tree, ql, qr, l, r, i) {
			if (ql <= this.array[l] && qr >= this.array[r]) {
				return tree[i];
			}
			if (this.array[l] > qr || this.array[r] < ql) {
				return Infinity;
			}

			let mid = Math.floor((l + r) / 2);

			return (Math.min(
				this.rangeMinQuery(tree, ql, qr, l, mid, i * 2 + 1),
				this.rangeMinQuery(tree, ql, qr, mid + 1, r, i * 2 + 2)
			));
		}
	},

	readArrayFromFiles: () => {
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
};