//libraries
import util from 'util';
import bcrypt from 'bcryptjs';
const sendmail = require('sendmail')({silent: true});

//utilities
import { log } from '../utilities/logging';
import validateEmail from '../utilities/validate_email';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

export const apiSignup = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj);
		res.end();
	}

	return formidablePromise(req)
		.then(validateSignup)
		.then(saveToDatabase)
		.then(sendSignupEmail)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const validateSignup = ({ fields }) => new Promise(async (resolve, reject) => {

	//validate email, username and password
	if (!validateEmail(fields.email) || fields.username.length < 4 || fields.username.length > 100 || fields.password.length < 8 || fields.password !== fields.retype || fields.code.length > 100 || (fields.referral && fields.referral.length > 100)) {
		return reject({msg: 'Invalid signup data', extra: [fields.email, fields.username]});
	}

	//check to see if the email has been banned
	const bannedQuery = 'SELECT COUNT(*) as total FROM bannedEmails WHERE email = ?;';
	const banned = await pool.promise().query(bannedQuery, [fields.email])
		.then((results) => results[0][0].total > 0)
	;

	//if the email has been banned
	if (banned) {
		return reject({msg: 'This email account has been banned!', extra: [fields.email]});
	}

	//check if email, username already exists
	const existsQuery = 'SELECT (SELECT COUNT(*) FROM accounts WHERE email = ?) AS email, (SELECT COUNT(*) FROM accounts WHERE username = ?) AS username;';
	const exists = await pool.promise().query(existsQuery, [fields.email, fields.username])
		.then((results) => new Promise((resolve, reject) => {
			results[0][0].email === 0 ? resolve(results) : reject('Email already registered!')
		} ))
		.then((results) => new Promise((resolve, reject) => {
			results[0][0].username === 0 ? resolve(results) : reject('Username already registered!')
		} ))
		.catch(e => e)
	;

	if (typeof(exists) === 'string') {
		return reject({msg: exists, extra: [fields.email, fields.username]});
	}

	//all went well
	return resolve(fields);
});

export const saveToDatabase = (fields) => new Promise(async (resolve, reject) => {
	const salt = await bcrypt.genSalt(11);
	const hash = await bcrypt.hash(fields.password, salt);

	//generate a random number as a token
	const rand = Math.floor(Math.random() * 2000000000);

	//save the generated data to the signups table
	const signupQuery = 'REPLACE INTO signups (email, username, hash, promotions, code, referral, verify) VALUES (?, ?, ?, ?, ?, ?, ?);';
	await pool.promise().query(signupQuery, [fields.email, fields.username, hash, fields.promotions ? true : false, fields.code, !!fields.referral ? fields.referral : null, rand]);

	return resolve({rand, ...fields});
});

export const sendSignupEmail = (fields) => new Promise(async (resolve, reject) => {
	const send = util.promisify(sendmail);

	const addr = `https://${process.env.WEB_ADDRESS}/api/verify?email=${fields.email}&verify=${fields.rand}`
	const msg = 'Hello! Please visit the following address to verify your account: ';

	//TODO: add encryption
	await send({
		from: `signup@${process.env.WEB_ADDRESS}`,
		to: fields.email,
		subject: 'Email Verification',
		text: msg + addr,
	})
		.then(() => resolve({msg: 'Verification email sent!', extra: [fields.email, fields.username]}))
		.catch(e => reject({msg: 'Something went wrong', extra: e }))
	;
});
