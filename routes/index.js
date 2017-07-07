const express = require('express');
const router = express.Router();
const generator = require('../src/generator');
const solver = require('../src/solver');
const segmentTreeUtils = require('../src/segmentTreeUtils');

/**
 * Контроллер принимает два query параметра GET запроса
 * left - левая граница отрезка поиска
 * right - правая граница отрезка поиска
 * [left, right] - границы включаются
 */
router.get('/', (req, res, next) => {
	try {
		const left = +req.query.left;
		const right = +req.query.right;

		const response = {
			result: solver.getMinimum(left, right)
		};

		res.json(response);
	} catch (err) {
		res.status(500).end();
	}
});

/**
 * Контроллер принимает новое число в теле POST запроса для добавления в набор
 */
router.post('/', (req, res, next) => {
	try {
		const number = +req.body.number;
		solver.addNumber(number);
		res.end();
	} catch (err) {
		res.status(500).end();
	}
});

/**
 * Контроллер удаляет текущий набор чисел и генерирует новый
 */
router.delete('/', (req, res, next) => {
	generator.clear().then(() => {
		segmentTreeUtils.clearAll();

		return generator.generate(
			global.initialSetSize,
			global.minValue,
			global.maxValue,
			global.countOfParts);
	}).then(() => {
		return segmentTreeUtils.init();
	}).then(() => {
		res.end();
	}).catch((err) => {
		//TODO: тут могли быть очень серьезные ошибки
		console.log(err);
	});
});

module.exports = router;
