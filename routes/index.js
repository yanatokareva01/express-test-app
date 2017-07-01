const express = require('express');
const router = express.Router();
const generator = require('../src/generator');
const solver = require('../src/solver');

/**
 * Контроллер принимает два query параметра GET запроса
 * left - левая граница отрезка поиска
 * right - правая граница отрезка поиска
 * [left, right] - границы включаются
 */
router.get('/', (req, res, next) => {
	const left = req.query.left;
	const right = req.query.right;

	solver.getMinimum(left, right).then(function (minimum) {
		const response = {
			result: minimum
		};
		res.json(response);
	});
});

/**
 * Контроллер принимает новое число в теле POST запроса для добавления в набор
 */
router.post('/', (req, res, next) => {
	const number = req.body.number;
	solver.addNumber(number);
	res.end();
});

/**
 * Контроллер удаляет текущий набор чисел и генерирует новый
 */
router.delete('/', (req, res, next) => {
	generator.clear().then(() => {
		return generator.generate(
			global.initialSetSize,
			global.minValue,
			global.maxValue,
			global.countOfParts);
	}).then(() => {
		res.end();
	});
});

module.exports = router;
