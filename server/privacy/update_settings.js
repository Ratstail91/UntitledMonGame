//environment variables
require('dotenv').config();

//utilities
const { log } = require('../utilities/logging.js');
const formidablePromise = require('../utilities/formidable_promise.js');
const pool = require("../utilities/database.js")

const { validateSession } = require('../accounts/sessions.js');
const { sendPrivacySettings } = require('./settings.js');

const apiUpdateSettings = async (req, res) => {
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

	return formidablePromise(req)
		.then(validateSession)
		.then(updatePrivacySettings)
		.then(sendPrivacySettings(res))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const updatePrivacySettings = (fields) => new Promise(async (resolve, reject) => {
	const query = 'UPDATE accounts SET promotions = ? WHERE id = ?;';

	return pool.promise().query(query, [fields.promotions ? true : false, fields.id])
		.then(results => results[0].affectedRows > 0 ? resolve(fields) : reject({ msg: 'updatePrivacySettings error', extra: 'affected rows = 0' }))
		.catch(e => reject({ msg: 'updatePrivacySettings error', extra: e }))
	;
});

module.exports = {
	apiUpdateSettings,

	//for testing
	updatePrivacySettings,
};
