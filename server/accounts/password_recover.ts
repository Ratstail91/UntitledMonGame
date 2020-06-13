//environment variables
require('dotenv').config();

//libraries
import util from 'util';
const sendmail = require('sendmail')({silent: true});

//utilities
import { log } from '../utilities/logging';
import validateEmail from '../utilities/validate_email';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

export const apiPasswordRecover = (req, res) => {
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
		.then(checkEmailExists)
		.then(createRecoverRecord)
		.then(sendRecoveryEmail)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const checkEmailExists = ({ fields }) => new Promise((resolve, reject) => {
	//validate email
	if (!validateEmail(fields.email)) {
		return reject({msg: 'Invalid recover data', extra: [fields.email]});
	}

	//check email is attached to an account
	const query = 'SELECT * FROM accounts WHERE email = ?;';
	return pool.promise().query(query, [fields.email])
		.then((results: any) => results[0].length === 1 ? resolve(results[0][0]) : reject({ msg: 'Email not found', extra: '' }))
		.catch(e => reject({ msg: 'checkEmailExists error', extra: e }))
	;
});

export const createRecoverRecord = (accountRecord) => new Promise(async (resolve, reject) => {
	const rand = Math.floor(Math.random() * 2000000000);

	const query = 'REPLACE INTO passwordRecover (accountId, token) VALUES (?, ?);';
	await pool.promise().query(query, [accountRecord.id, rand]);

	return resolve({ accountRecord, rand });
});

export const sendRecoveryEmail = ({ accountRecord, rand }) => new Promise(async (resolve, reject) => {
	const send = util.promisify(sendmail);

	const addr = `http://${process.env.WEB_ADDRESS}/passwordreset?email=${accountRecord.email}&token=${rand}`;
	const msg = `Hello! Please visit the following address to set a new password (if you didn\'t request a password recovery, ignore this email): ${addr}`;

	await send({
		from: `passwordrecover@${process.env.WEB_ADDRESS}`,
		to: accountRecord.email,
		subject: 'Password Recovery',
		text: msg,
	})
		.then(() => resolve({msg: 'Recovery email sent!', extra: [accountRecord.email, accountRecord.username]}))
		.catch(() => reject({msg: 'Something went wrong (did you use a valid email?)', extra: [accountRecord.email, accountRecord.username]}))
	;
});
