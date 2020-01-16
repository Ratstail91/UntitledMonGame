//libraries
const util = require('util');
const bcrypt = require('bcryptjs');

//utilities
const { log, logActivity } = require('../utilities/logging.js');
const validateEmail = require('../utilities/validate_email.js');
const formidablePromise = require('../utilities/formidable_promise.js');

const loginRequest = (connection) => (req, res) => {
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
		.then(validateFields(connection))
		.then(validatePassword(connection))
		.then(createNewSession(connection))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const validateFields = (connection) => ({ fields }) => new Promise( async (resolve, reject) => {
	//validate email, username and password
	if (!validateEmail(fields.email) || fields.password.length < 8) {
		return reject({msg: 'Invalid login data', extra: [fields.email] }); //WARNING: NEVER LOG PASSWORDS. EVER.
	}

	//check to see if the email has been banned
	const bannedQuery = 'SELECT COUNT(*) as total FROM bannedEmails WHERE email = ?;';

	const banned = await connection.query(bannedQuery, [fields.email])
		.then(results => results[0].total > 0)
	;

	if (banned) {
		return reject({msg: 'This email account has been banned!', extra: [fields.email]});
	}

	return resolve(fields);
});

const validatePassword = (connection) => (fields) => new Promise( async (resolve, reject) => {
	//find this email's account information
	const accountQuery = 'SELECT id, email, username, hash FROM accounts WHERE email = ?;';
	const accountRecord = await connection.query(accountQuery, [fields.email])
		.then(results => results[0])
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

const createNewSession = (connection) => (accountRecord) => new Promise( async (resolve, reject) => {
	//create the new session
	const rand = Math.floor(Math.random() * 2000000000); //TODO: uuid

	const sessionQuery = 'INSERT INTO sessions (accountId, token) VALUES (?, ?);';
	await connection.query(sessionQuery, [accountRecord.id, rand]);

	const result = {
		id: accountRecord.id,
		email: accountRecord.email,
		username: accountRecord.username,
		token: rand,
		msg: 'Logged in',
		extra: [accountRecord.email, rand]
	};

	logActivity(connection, accountRecord.id);

	return resolve(result);
});

const logoutRequest = (connection) => (req, res) => {
	let deleteQuery = 'DELETE FROM sessions WHERE sessions.accountId = ? AND token = ?;'; //NOTE: The user now loses this access token
	return connection.query(deleteQuery, [req.body.id, req.body.token])
		.then(() => {
			//logging
			log('Logged out', req.body.id, req.body.token);
			logActivity(connection, req.body.id);
			res.end();
		})
	;
};

//reusable
const validateSession = (connection) => ({ fields }) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';
	return connection.query(query, [fields.id, fields.token])
		.then(results => results.length >= 0 ? resolve(fields) : reject({ msg: 'Invalid session', extra: fields }))
		.catch(e => reject({ msg: 'validateSession error', extra: e }))
	;
});

module.exports = {
	//public API
	loginRequest,
	logoutRequest,
	validateSession,

	//for testing
	validateFields,
	validatePassword,
	createNewSession,
};

