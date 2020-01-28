//utilities
const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js")

const { validateSession } = require('../accounts/sessions.js');

const apiAdminDisplay = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	};

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(validateAccountType)
		.then(getDailySnapshots)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateAccountType = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM accounts WHERE id = ? AND accountType ="administrator";';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].total == 1 ? resolve(fields) : reject({ msg: 'Invalid administrator status', extra: fields }))
		.catch(e => reject({ msg: 'validateAccountType error', extra: e }))
	;
});

const getDailySnapshots = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM dailySnapshots;';
	return pool.promise().query(query)
		.then(results => results[0])
		.then(results => resolve({ msg: results, extra: '' }))
		.catch(e => reject({ msg: 'getDailySnapshots error', extra: e }))
	;
});

module.exports = {
	apiAdminDisplay,

	//for testing
	getDailySnapshots,
};
