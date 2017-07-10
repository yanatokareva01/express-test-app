const mongoose = require('mongoose');

let segmentSchema = new mongoose.Schema({
	number: {
		type: Number,
		required: true,
		index: true
	},
});

let models = [];

for (let i = 0; i < global.countOfParts; i++) {
	models.push(mongoose.model(`part${i + 1}`, segmentSchema, `part${i+1}`))
}

module.exports = models;