/**
 * Created by Yana Tokareva on 06.07.2017.
 */
"use strict";

module.exports = class SegmentTree {
	constructor(tree) {
		this.tree = tree;
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
};