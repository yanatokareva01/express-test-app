const mongoose = require('mongoose');

let segmentSchema = new mongoose.Schema({
	numbers: {
		type: [],
		required: true
	},
	part: {
		type: Number,
		required: true,
		unique: true,
		index: true
	}
});

let Segment = mongoose.model('Segment', segmentSchema, 'data');

module.exports = Segment;