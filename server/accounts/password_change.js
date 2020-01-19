//environment variables
require('dotenv').config();

//libraries
const util = require('util');
const bcrypt = require('bcryptjs');

//utilities
const { log } = require('../utilities/logging.js');
const formidablePromise = require('../utilities/formidable_promise.js');
const pool = require("../utilities/database.js")

const apiPasswordChange = async (req, res) => {
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
		.then(validateAccount)
		.then(validatePassword)
		.then(changePassword)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateAccount = ({ fields }) => new Promise(async (resolve, reject) => {
	const validateQuery = 'SELECT accounts.id AS id, accounts.hash AS hash, sessions.token AS token FROM accounts JOIN sessions ON accounts.id = sessions.accountId WHERE accounts.id = ?;';
	const accountRecord = await pool.promise().query(validateQuery, [fields.id])
		.then(results => results[0][0])
		.catch(() => reject({ msg: 'Failed to validate account' }))
	;

	const compare = util.promisify(bcrypt.compare);

	return compare(fields.oldpassword, accountRecord.hash)
		.then(match => match ? resolve(fields) : reject( {msg: 'Incorrect password', extra: [fields.email, 'could not change password']} ))
		.catch(e => reject({ msg: 'Error in compare', extra: e}))
	;
});

const validatePassword = (fields) => new Promise((resolve, reject) => {
	if (fields.newpassword.length < 8 || fields.newpassword !== fields.retype) {
		return reject({msg: 'The new password is invalid', extra: [fields.email, fields.username]});
	}

	return resolve(fields);
});

const changePassword = (fields) => new Promise(async (resolve, reject) => {
	const salt = await bcrypt.genSalt(11);
	const hash = await bcrypt.hash(fields.newpassword, salt);

	const updateQuery = 'UPDATE IGNORE accounts SET hash = ? WHERE id = ?;';
	return pool.promise().query(updateQuery, [hash, fields.id])
		.then(result => result[0].affectedRows > 0 ? resolve({ msg: 'Password updated successfully ', extra: '' }) : reject({msg: 'Failed to update password', extra: 'affectedRows == 0' }))
		.catch(e => reject({ msg: 'Failed to update password', extra: e }))
	;
});

module.exports = {
	apiPasswordChange,

	//for testing
	validateAccount,
	validatePassword,
	changePassword,
};