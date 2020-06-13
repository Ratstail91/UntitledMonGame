//environment variables
require('dotenv').config();

//libraries
import util from 'util';
import bcrypt from 'bcryptjs';

//utilities
import { log } from '../utilities/logging';
import validateEmail from '../../common/utilities/validate_email';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

export const apiPasswordReset = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj);
		res.end();
	};

	return formidablePromise(req)
		.then(validateCredentials)
		.then(validateToken)
		.then(changePassword)
		.then(removeFromRecovery)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const validateCredentials = ({ fields }) => new Promise((resolve, reject) => {

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

export const validateToken = (fields) => new Promise((resolve, reject) => {
	//get the account from this email
	const query = 'SELECT * FROM accounts WHERE email = ? AND id IN (SELECT passwordRecover.accountId FROM passwordRecover WHERE token = ?);';
	return pool.promise().query(query, [fields.email, fields.token])
		.then((results: any) => results[0].length === 1 ? resolve({ accountRecord: results[0][0], fields: fields }) : reject({ msg: 'Invalid reset data (incorrect parameters/database state)', extra: fields.email }))
		.catch(e => reject({ msg: 'validateToken error', extra: e }))
	;
});

export const changePassword = ({ accountRecord, fields }) => new Promise(async (resolve, reject) => {
	const salt = await bcrypt.genSalt(11);
	const hash = await bcrypt.hash(fields.password, salt);

	const updateQuery = 'UPDATE IGNORE accounts SET hash = ? WHERE id = ?;';
	return pool.promise().query(updateQuery, [hash, accountRecord.id])
		.then((result: any) => result[0].affectedRows > 0 ? resolve({ msg: 'Password updated successfully ', accountRecord: accountRecord }) : reject({msg: 'Failed to update password', extra: 'affectedRows == 0' }))
		.catch(e => reject({ msg: 'Failed to update password', extra: e }))
	;
});

export const removeFromRecovery = ({ msg, accountRecord }) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM passwordRecover WHERE accountId = ?;';
	return pool.promise().query(query, [accountRecord.id])
		.then(result => resolve({ msg: msg, extra: '' }))
		.catch(e => reject({ msg: 'removeFromRecovery error', extra: e }))
	;
});
