const fs = require('fs');
const path = require('path');
const Q = require('q');
const dataDir = path.join(__dirname, '../data');

module.exports = {
	SegmentTree: class SegmentTree {
		constructor(array) {
			this.array = array;
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
				let infinityCount = Math.ceil(treeSize /2) - this.array.length;
				for (let i = 0; i < infinityCount; i++) {
					this.array.push(Infinity);
				}
			}

			let tree = Array(treeSize);
			for (let i = 0; i < tree.length; i++) {
				tree[i] = {
					min: Infinity,
					l: Infinity,
					r: Infinity
				};
			}

			return tree;
		}

		build(array, tree, l, r, i) {
			if (l == r) {
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