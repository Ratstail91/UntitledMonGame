//environment variables
require('dotenv').config();

//utilities
const { log } = require('../utilities/logging.js');
const formidablePromise = require('../utilities/formidable_promise.js');

const { validateSession } = require('../accounts/sessions.js');
const { sendPrivacySettings } = require('./settings.js');

const apiUpdateSettings = (connection) => (req, res) => {
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
		.then(validateSession(connection))
		.then(updatePrivacySettings(connection))
		.then(sendPrivacySettings(connection, res))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const updatePrivacySettings = (connection) => (fields) => new Promise(async (resolve, reject) => {
	const query = 'UPDATE accounts SET promotions = ? WHERE id = ?;';

	return connection.query(query, [fields.promotions ? true : false, fields.id])
		.then(results => results.affectedRows > 0 ? resolve(fields) : reject({ msg: 'updatePrivacySettings error', extra: 'affected rows = 0' }))
		.catch(e => reject({ msg: 'updatePrivacySettings error', extra: e }))
	;
});

module.exports = {
	apiUpdateSettings,

	//for testing
	updatePrivacySettings,
};
