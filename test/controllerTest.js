process.env.NODE_ENV = 'test';
const assert = require('chai').assert;
const { describe, it, before, after } = require('mocha');
const SegmentTree = require('../background/segmentTreeBuilder');
const segmentTreeUtils = require('../src/segmentTreeUtils');
const solver = require('../src/solver');
const fs = require('fs');
const path = require('path');
const readFile = require('util').promisify(fs.readFile);
const unlink = require('util').promisify(fs.unlink);
const initialSetSize = 12;

describe('Тестирование модуля solver.js', function() {
	before(function() {
		let numbers = generateNumbers();
		let segmentTree = new SegmentTree();
		segmentTree.makeTree(numbers);
		segmentTreeUtils.segmentTree.array = numbers;
		segmentTreeUtils.segmentTree.tree = segmentTree.tree;
	});

	describe('Тестирование функции getMinimum()', function() {
		it('При left = 1 и right = 1 результат 1', function() {
			assert.equal(solver.getMinimum(1, 1), 1);
		});

		it('При left = 1 и right = 100 результат 1', function() {
			assert.equal(solver.getMinimum(1, 100), 1);
		});

		it('При left = 2 и right = 100 результат 3', function() {
			assert.equal(solver.getMinimum(2, 100), 3);
		});

		it('При left = 4 и right = 7 результат 4', function() {
			assert.equal(solver.getMinimum(4, 7), 4);
		});

		it('При left = 10 и right = 20 результат Infinity', function() {
			assert.equal(solver.getMinimum(10, 20), Infinity);
		});

		it('При left = 20 и right = 10 результат null', function() {
			assert.equal(solver.getMinimum(20, 10), null);
		});
	});

	describe('Тестирование функции addNumber()', function() {
		let fileName = path.join(__dirname, '../data/partNaN.txt');

		describe('Добавление числа 10', function() {
			it('getMinimum(10, 20) вернет Infinity', function () {
				assert.equal(solver.getMinimum(10, 20), Infinity);
			});

			it('При добавлении числа 10 файл partNaN.txt содержит 10', function (done) {
				solver.addNumber(10)
					.then(() => readFile(fileName, 'utf8'))
					.then((result) => {
						result = result.split('\n');
						assert.isTrue(result.includes('10'));
						done();
					});
			});

			it('При добавлении числа 10 getMinimum(10, 20) вернет 10', function (done) {
				solver.addNumber(10)
					.then(() => {
						assert.equal(solver.getMinimum(10, 20), 10);
						done();
					});
			});

		});

		describe('Добавление числа 1', function() {
			it('getMinimum(1, 10) вернет 1', function () {
				assert.equal(solver.getMinimum(1, 10), 1);
			});

			it('При добавлении числа 1 файл partNaN.txt содержит 1', function (done) {
				solver.addNumber(1)
					.then(() => readFile(fileName, 'utf8'))
					.then((result) => {
						result = result.split('\n');
						assert.isTrue(result.includes('1'));
						done();
					});
			});

			it('При добавлении числа 1 getMinimum(1, 10) вернет 1', function (done) {
				solver.addNumber(1)
					.then(() => {
						assert.equal(solver.getMinimum(1, 10), 1);
						done();
					});
			});

		});

		describe('Добавление числа больше maxValue (maxValue = 30)', function() {
			global.maxValue = 30;

			it('Число 31 не появится в файле', function(done) {
				solver.addNumber(global.maxValue + 1)
					.catch(() => {
						readFile(fileName, 'utf8')
							.then((result) => {
								result = result.split('\n');
								assert.isFalse(result.includes(String(global.maxValue + 1)));
								done();
							})
							.catch(() => done());
					});
			});

			it('getMinimum() от числа больше максимального вернет null', function() {
				assert.isNull(solver.getMinimum(global.maxValue + 1));
			});
		});

		after(function(done) {
			unlink(fileName).then(done);
		});
	})
});

function generateNumbers() {
	let numbers = [];
	for (let i = 1; i <= initialSetSize; i++) {
		numbers.push(func(i));
	}

	return numbers;
}

/**
 * Кусочная функция в натуральные числа
 * @param x
 * @returns {Number}
 */
function func (x) {
	if (x >= 1 && x <= 3) {
		return x*x;
	} else if (x > 3 && x <= 6) {
		return 12 - x;
	} else if (x > 6 && x <= 9) {
		return 7 - (x - 7)*(x - 7);
	} else if (x > 9 && x <= 12) {
		return x - 6;
	}
}