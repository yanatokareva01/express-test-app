const express = require('express');
const router = express.Router();
const generator = require('../src/generator');
const solver = require('../src/solver');
const mongoose = require('mongoose');

/**
 * Контроллер принимает два query параметра GET запроса
 * left - левая граница отрезка поиска
 * right - правая граница отрезка поиска
 * [left, right] - границы включаются
 */
router.get('/', (req, res, next) => {
	const left = +req.query.left;
	const right = +req.query.right;

	if (left > right || left > global.maxValue || right < global.minValue) {
		res.status(400).end();
		return;
	}

	solver.getMinimum(left, right)
		.then((result) => {
			result = result || null;
			res.json({ result });
		})
		.catch((err) => {
			if (err instanceof mongoose.Model) {
				res.send({number: err.number})
			} else {
				res.status(500).end();
			}
		});
});

/**
 * Контроллер принимает новое число в теле POST запроса для добавления в набор
 */
router.post('/', (req, res, next) => {
	const number = req.body.number;
	if (number < global.minValue || number > global.maxValue) {
		res.status(400).end();
		return;
	}

	solver.addNumber(number)
		.then(() => {
			res.end();
		})
		.catch(() => {
			res.send(500).end();
		});
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
