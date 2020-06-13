//libraries
import util from 'util';
import bcrypt from 'bcryptjs';

//utilities
//utilities
import { log, logActivity } from '../utilities/logging';
import validateEmail from '../utilities/validate_email';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

export const apiLogin = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj);
		res.end();
	}

	return formidablePromise(req)
		.then(validateLoginFields)
		.then(validateLoginPassword)
		.then(unmarkAccountForDeletion)
		.then(checkAccountType)
		.then(createNewSession)
		.then(createNewProfile)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const validateLoginFields = ({ fields }) => new Promise( async (resolve, reject) => {
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

export const validateLoginPassword = (fields) => new Promise( async (resolve, reject) => {
	//find this email's account information
	const accountQuery = 'SELECT id, hash FROM accounts WHERE email = ?;';
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

export const unmarkAccountForDeletion = (accountRecord) => new Promise((resolve, reject) => {
	//for setting things back to normal
	const query = 'UPDATE accounts SET deletionTime = NULL WHERE id = ?;';
	return pool.promise().query(query, [accountRecord.id])
		.then(() => resolve(accountRecord))
		.catch(e => reject({ msg: 'unmarkAccountForDeletion error', extra: e }))
	;
});

export const checkAccountType = (accountRecord) => new Promise(async (resolve, reject) => {
	const query = 'SELECT accountType FROM accounts WHERE id = ?;';
	const accountType = await pool.promise().query(query, [accountRecord.id])
		.catch(e => reject({ msg: 'checkAccountType error', extra: e }))
	;

	//accountType ENUM ('administrator', 'moderator', 'alpha', 'beta', 'normal') DEFAULT 'normal',
	switch(accountType[0][0].accountType) {
		case "administrator":
		case "moderator":
		case "alpha":
			return resolve(accountRecord);
		default:
			;
	}

	//TODO: update this message later
	return reject({ msg: 'The game isn\'t ready yet, sorry.\nContact krgamestudios@gmail.com for an alpha account.', extra: [accountRecord.id, accountType[0][0].accountType] });
});

export const createNewSession = (accountRecord) => new Promise( async (resolve, reject) => {
	//create the new session
	const rand = Math.floor(Math.random() * 2000000000);

	const sessionQuery = 'INSERT INTO sessions (accountId, token) VALUES (?, ?);';
	await pool.promise().query(sessionQuery, [accountRecord.id, rand]);

	const result = {
		id: accountRecord.id,
		token: rand,
		msg: 'Logged in',
		extra: [accountRecord.id, rand]
	};

	logActivity(accountRecord.id);

	return resolve(result);
});

export const createNewProfile = (accountRecord) => new Promise(async (resolve, reject) => {
	const total = (await pool.promise().query('SELECT COUNT(*) AS total FROM profiles WHERE accountId = ?;', accountRecord.id))[0][0].total;

	if (!total) {
		await pool.promise().query('INSERT INTO profiles (accountId) VALUES (?);', [accountRecord.id]);

		const profileId = (await pool.promise().query('SELECT id FROM profiles WHERE accountId = ?;', [accountRecord.id]))[0][0].id;

		//NOTE: grant starting items
		await pool.promise().query('INSERT INTO items (profileId, idx) VALUES (?, "incubator");', [profileId]);
		await pool.promise().query('INSERT INTO items (profileId, idx) VALUES (?, "battlebox");', [profileId]);
	}

	return resolve(accountRecord);
});

export const apiLogout = (req, res) => {
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

//delete the sessions for inactive accounts
import { CronJob } from 'cron';

const job = new CronJob('0 0 0 * * *', () => {
	const query = 'DELETE FROM sessions WHERE accountId IN (SELECT id FROM accounts WHERE lastActivityTime < NOW() - interval 2 day);';
	pool.promise().query(query)
		.catch(e => log('Session deletion error: ', e));
});

job.start();

module.exports = {
	//public API
	apiLogin,
	apiLogout,

	//for testing
	validateLoginFields,
	validateLoginPassword,
	unmarkAccountForDeletion,
	checkAccountType,
	createNewSession,
	createNewProfile,
};

