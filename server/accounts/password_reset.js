//environment variables
require('dotenv').config();

//libraries
const util = require('util');
const bcrypt = require('bcryptjs');

//utilities
const { log } = require('../utilities/logging.js');
const { throttle, isThrottled } = require('../utilities/throttling.js');
const validateEmail = require('../utilities/validate_email.js');
const formidablePromise = require('../utilities/formidable_promise.js');

const apiPasswordReset = (connection) => (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj);
		res.end();
	};

	return formidablePromise(req)
		.then(validateCredentials(connection))
		.then(validateToken(connection))
		.then(changePassword(connection))
		.then(removeFromRecovery(connection))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateCredentials = (connection) => ({ fields }) => new Promise((resolve, reject) => {
	if (isThrottled(fields.email)) {
		return reject({msg: 'Reset throttled', extra: [fields.email]});
	}

	throttle(fields.email);

	//validate email
	if (!validateEmail(fields.email)) {
		return reject({msg: 'Invalid reset data', extra: [fields.email]});
	}

	//validate password
	if (fields.password.length < 8 || fields.password !== fields.retype) {
		return reject({msg: 'The new password is invalid', extra: [fields.email]});
	}

	return resolve(fields);
});

const validateToken = (connection) => (fields) => new Promise((resolve, reject) => {
	//get the account from this email
	const query = 'SELECT * FROM accounts WHERE email = ? AND id IN (SELECT passwordRecover.accountId FROM passwordRecover WHERE token = ?);';
	return connection.query(query, [fields.email, fields.token])
		.then(results => results.length === 1 ? resolve({ accountRecord: results[0], fields: fields }) : reject({ msg: 'Invalid reset data (incorrect parameters/database state)', extra: fields.email }))
		.catch(e => reject({ msg: 'validateToken error', extra: e }))
	;
});

const changePassword = (connection) => ({ accountRecord, fields }) => new Promise(async (resolve, reject) => {
	const salt = await bcrypt.genSalt(11);
	const hash = await bcrypt.hash(fields.password, salt);

	const updateQuery = 'UPDATE IGNORE accounts SET hash = ? WHERE id = ?;';
	return connection.query(updateQuery, [hash, accountRecord.id])
		.then(result => result.affectedRows > 0 ? resolve({ msg: 'Password updated successfully ', accountRecord: accountRecord }) : reject({msg: 'Failed to update password', extra: 'affectedRows == 0' }))
		.catch(e => reject({ msg: 'Failed to update password', extra: e }))
	;
});

const removeFromRecovery = (connection) => ({ msg, accountRecord }) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM passwordRecover WHERE accountId = ?;';
	return connection.query(query, [accountRecord.id])
		.then(result => resolve({ msg: msg, extra: '' }))
		.catch(e => reject({ msg: 'removeFromRecovery error', extra: e }))
	;
});

module.exports = {
	apiPasswordReset,

	//for testing
	validateCredentials,
	validateToken,
	changePassword,
	removeFromRecovery,
};