const Winston = require('winston');

module.exports = function(filename) {
	return new Winston.Logger({
		transports: [
			new Winston.transports.File({
				timestamp: true,
				filename: filename
			}),
			new Winston.transports.Console({
				timestamp: true
			})
		]
	});
};