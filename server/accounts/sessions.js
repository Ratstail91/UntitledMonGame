//libraries
const util = require('util');
const bcrypt = require('bcryptjs');

//utilities
const { log, logActivity } = require('../utilities/logging.js');
const validateEmail = require('../utilities/validate_email.js');
const formidablePromise = require('../utilities/formidable_promise.js');
const pool = require("../utilities/database.js");

const apiLogin = async (req, res) => {
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
		.then(validateFields)
		.then(validatePassword)
		.then(unmarkAccountForDeletion)
		.then(createNewSession)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateFields = ({ fields }) => new Promise( async (resolve, reject) => {
	//validate email, username and password
	if (!validateEmail(fields.email) || fields.password.length < 8) {
		return reject({msg: 'Invalid login data', extra: [fields.email] }); //WARNING: NEVER LOG PASSWORDS. EVER.
	}

	//check to see if the email has been banned
	const bannedQuery = 'SELECT COUNT(*) as total FROM bannedEmails WHERE email = ?;';

	const banned = await pool.promise().query(bannedQuery, [fields.email])
		.then(results => results[0][0].total > 0)
	;

	if (banned) {
		return reject({msg: 'This email account has been banned!', extra: [fields.email]});
	}

	return resolve(fields);
});

const validatePassword = (fields) => new Promise( async (resolve, reject) => {
	//find this email's account information
	const accountQuery = 'SELECT id, email, username, hash FROM accounts WHERE email = ?;';
	const accountRecord = await pool.promise().query(accountQuery, [fields.email])
		.then(results => results[0][0])
		.catch(() => null)
	;

	if (!accountRecord) {
		return reject({msg: 'Incorrect email or password', extra: [fields.email, 'Did not find this email']}); //NOTE: deliberately obscure incorrect email or password
	}

	const compare = util.promisify(bcrypt.compare);

	return compare(fields.password, accountRecord.hash)
		.then(match => match ? resolve(accountRecord) : reject({msg: 'Incorrect email or password', extra: [fields.email, 'Did not find this password']}))
		.catch(e => reject({ msg: 'Error in compare', extra: e}))
	;
});

const unmarkAccountForDeletion = (fields) => new Promise(async (resolve, reject) => {
	//for setting things back to normal
	const query = 'UPDATE accounts SET deletionTime = NULL WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'unmarkAccountForDeletion error', extra: e }))
	;
});

const createNewSession = (accountRecord) => new Promise( async (resolve, reject) => {
	//create the new session
	const rand = Math.floor(Math.random() * 2000000000); //TODO: uuid

	const sessionQuery = 'INSERT INTO sessions (accountId, token) VALUES (?, ?);';
	await pool.promise().query(sessionQuery, [accountRecord.id, rand]);

	const result = {
		id: accountRecord.id,
		email: accountRecord.email,
		username: accountRecord.username,
		token: rand,
		msg: 'Logged in',
		extra: [accountRecord.email, rand]
	};

	logActivity(result.id);

	return resolve(result);
});

const apiLogout = (req, res) => {
	let deleteQuery = 'DELETE FROM sessions WHERE sessions.accountId = ? AND token = ?;'; //NOTE: The user now loses this access token
	return pool.promise().query(deleteQuery, [req.body.id, req.body.token])
		.then(() => {
			//logging
			log('Logged out', req.body.id, req.body.token);
			logActivity(req.body.id);

			res.end();
		})
	;
};

//reusable
const validateSession = ({ fields }) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';
	return pool.promise().query(query, [fields.id, fields.token])
		.then(results => results[0].length > 0 ? fields : reject({ msg: 'Session Timed Out', extra: fields }))
		.then(fields => { logActivity(fields.id); resolve(fields); })
		.catch(e => reject({ msg: 'validateSession error', extra: e }))
	;
});

//delete the sessions for inactive accounts
const { CronJob } = require('cron');

const job = new CronJob('0 0 0 * * *', async () => {
	const query = 'DELETE FROM sessions WHERE accountId IN (SELECT id FROM accounts WHERE lastActivityTime < NOW() - interval 2 days);';
	pool.promise().query(query)
		.catch(e => log('Session deletion error: ', e));
});

job.start();

module.exports = {
	//public API
	apiLogin,
	apiLogout,
	validateSession,

	//for testing
	validateFields,
	validatePassword,
	unmarkAccountForDeletion,
	createNewSession,
};

