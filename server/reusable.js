const { log, logActivity } = require('./utilities/logging.js');
const pool = require("./utilities/database.js");

//reusable
const validateSession = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';
	return pool.promise().query(query, [fields.id, fields.token])
		.then(results => results[0].length > 0 ? fields : reject({ msg: 'Session Timed Out', extra: fields }))
		.then(fields => { logActivity(fields.id); resolve(fields); })
		.catch(e => reject({ msg: 'validateSession error', extra: e }))
	;
});

module.exports = {
	validateSession,
};