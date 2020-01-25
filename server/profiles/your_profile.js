const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const apiYourProfile = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateCredentials)
		.then(getYourProfile)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateCredentials = (body) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM sessions WHERE accountId = ? AND token = ?;';
	return pool.promise().query(query, [body.id, body.token])
		.then(result => result[0][0])
		.then(record => record && record.total > 0 ? resolve(body.id) : reject({ msg: 'Invalid credentials', extra: JSON.stringify(record) }))
		.catch(e => reject({ msg: 'validateCredentials error', extra: e }))
	;
});

const getYourProfile = (id) => new Promise((resolve, reject) => {
	//TODO: send creatures
	const query = 'SELECT username, coins FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [id])
		.then(result => result[0][0])
		.then(record => record ? resolve({ msg: record, extra: '' }) : reject({ msg: 'Failed to find record', extra: id }))
		.catch(e => reject({ msg: 'getYourProfile error', extra: e }))
	;
});

module.exports = {
	apiYourProfile,

	//for testing
	validateCredentials,
	getYourProfile,
};