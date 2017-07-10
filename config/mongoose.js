let database = process.env.MONGO_DB || 'segments';
let port = process.env.MONGO_PORT || 27017;
let host = process.env.MONGO_HOST || 'localhost';

module.exports = { port, host, database };