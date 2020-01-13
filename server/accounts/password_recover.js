//environment variables
require('dotenv').config();

//libraries
const util = require('util');
const sendmail = require('sendmail')({silent: true});

//utilities
const { log } = require('../utilities/logging.js');
const { throttle, isThrottled } = require('../utilities/throttling.js');
const validateEmail = require('../utilities/validate_email.js');
const formidablePromise = require('../utilities/formidable_promise.js');

const passwordRecoverRequest = (connection) => (req, res) => {
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
		.then(checkEmail(connection))
		.then(createRecoverRecord(connection))
		.then(sendEmail(connection))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkEmail = (connection) => ({ fields }) => new Promise((resolve, reject) => {
	if (isThrottled(fields.email)) {
		return reject({msg: 'Recover throttled', extra: [fields.email]});
	}

	throttle(fields.email);

	//validate email
	if (!validateEmail(fields.email)) {
		return reject({msg: 'Invalid recover data', extra: [fields.email, fields.username]});
	}

	//check email is attached to an account
	const query = 'SELECT * FROM accounts WHERE email = ?;';
	return connection.query(query, [fields.email])
		.then(results => results.length === 1 ? resolve(results[0]) : reject({ msg: 'Email not found', extra: '' }))
		.catch(e => reject({ msg: 'Error in checkEmail', extra: e }))
	;
});

const createRecoverRecord = (connection) => (accountRecord) => new Promise(async (resolve, reject) => {
	const rand = Math.floor(Math.random() * 2000000000);

	const query = 'REPLACE INTO passwordRecover (accountId, token) VALUES (?, ?);';
	await connection.query(query, [accountRecord.id, rand]);

	resolve({ accountRecord, rand });
});

const sendEmail = (connection) => ({ accountRecord, rand }) => new Promise(async (resolve, reject) => {
	const send = util.promisify(sendmail);

	const addr = `http://${process.env.WEB_ADDRESS}/passwordreset?email=${accountRecord.email}&token=${rand}`;
	const msg = `Hello! Please visit the following address to set a new password (if you didn\'t request a password recovery, ignore this email): ${addr}`;

	await send({
		from: `passwordrecover@${process.env.WEB_ADDRESS}`,
		to: accountRecord.email,
		subject: 'Password Recovery',
		text: msg,
	})
		.then(
			() => resolve({msg: 'Recovery email sent!', extra: [accountRecord.email, accountRecord.username]}),
			() => reject({msg: 'Something went wrong (did you use a valid email?)', extra: [accountRecord.email, accountRecord.username]})
		)
	;
});

module.exports = {
	passwordRecoverRequest: passwordRecoverRequest,

	//for testing
	checkEmail: checkEmail,
	createRecoverRecord: createRecoverRecord,
	sendEmail, sendEmail,
}