"use strict";

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
				array.push('Infinity');
			}
		}

		this.tree = new Array(treeSize);
		for (let i = 0; i < this.tree.length; i++) {
			this.tree[i] = {
				min: 'Infinity',
				l: 'Infinity',
				r: 'Infinity'
			};
		}

		this.build(array, this.tree, 0, array.length - 1, 0);
		return this.tree;
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

		tree[i].l = String(Math.min(tree[i*2 + 1].l, tree[i*2 + 2].l));
		tree[i].r = String(Math.max(tree[i*2 + 1].r, tree[i*2 + 2].r));
		tree[i].min = String(Math.min(tree[i * 2 + 1].min, tree[i * 2 + 2].min));
	}
}

let segmentTree = new SegmentTree();

process.on('message', (msg) => {
	if ((typeof msg === "object") && msg.hasOwnProperty('numbers')) {
		let tree = segmentTree.makeTree(msg.numbers);
		process.send({
			tree: tree
		});
	}
});