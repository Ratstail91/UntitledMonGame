//environment variables
require('dotenv').config();

//utilities
const { log } = require('../utilities/logging.js');
const formidablePromise = require('../utilities/formidable_promise.js');
const pool = require("../utilities/database.js")

const { validateSession } = require('../reusable.js');

const apiSettings = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
//		res.status(200).json(obj);
		res.end();
	};

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(sendPrivacySettings(res))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const sendPrivacySettings = (res) => (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => res.status(200).json({ promotions: results[0][0].promotions }))
		.then(() => resolve({ msg: 'Sent privacy settings', extra: [fields.id] }))
		.catch(e => reject({ msg: 'sendPrivacySettings error', extra: e }))
	;
});

module.exports = {
	apiSettings,
	sendPrivacySettings,
};
