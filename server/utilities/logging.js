const pool = require('./database.js')

const log = (msg, ...args) => {
	if (typeof msg == 'object') {
		msg = JSON.stringify(msg);
	}

	let dateString = Date().replace(/\s\(.*\)/i, ''); //dumb formatting
	console.log(`log ${dateString}: ${msg} (${args.toString()})`);
	return msg;
}

const logActivity = (id) => {
	let query = 'UPDATE accounts SET lastActivityTime = CURRENT_TIMESTAMP() WHERE id = ?;';
	pool.promise().query(query, [id], (err) => {
		if (err) throw err;
	});
};

module.exports = {
	log,
	logActivity,
};