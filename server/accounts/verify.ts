import { log } from '../utilities/logging';
import pool from '../utilities/database';

import { grantSignupRewards } from './signup_rewards';

export const apiVerify = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).write(obj.msg); //echo the ugly confirmation page
		res.end();
	}

	//pass the process along
	return getInformationFromDatabase(req)
		.then(verifyToken(req))
		.then(createAccount)
		.then(grantSignupRewards)
		.then(() => handleSuccess({msg: log('<p>Verification succeeded!</p><p><a href="/">Return Home</a></p>'), extra: [req.query.email]})) //TODO: prettier success page
		.catch(handleRejection)
	;
}

export const getInformationFromDatabase = (req) => new Promise((resolve, reject) => {
	//get the saved data
	let signupsQuery = 'SELECT * FROM signups WHERE email = ?;';
	return pool.promise().query(signupsQuery, [req.query.email])
		.then((results: any) => {
			if (results[0].length === 1) {
				resolve(results[0][0]);
			} else {
				reject({msg: 'That account does not exist or this link has already been used.', extra: [req.query.email, req.query.verify]})
			}
		})
	;
});

export const verifyToken = (req) => (signupRecord) => new Promise((resolve, reject) => {
	if (req.query.verify != signupRecord.verify) {
		reject({msg: 'Verification failed!', extra: [req.query.email, req.query.verify, signupRecord.verify]});
	} else {
		resolve(signupRecord);
	}
});

export const createAccount = (signupRecord) => new Promise((resolve, reject) => {
	//BUGFIX: a delay to prevent the fail message appearing to the end user
	setTimeout(async () => {
		log('Trying to create account', signupRecord.email);

		//move the data from signups to accounts
		let moveQuery = 'INSERT IGNORE INTO accounts (email, username, hash, promotions) VALUES (?, ?, ?, ?);';
		await pool.promise().query(moveQuery, [signupRecord.email, signupRecord.username, signupRecord.hash, signupRecord.promotions]);

		//delete from signups
		let deleteQuery = 'DELETE FROM signups WHERE email = ?;';
		await pool.promise().query(deleteQuery, [signupRecord.email]);

		resolve(signupRecord);

		log('Account created', signupRecord.email);
	}, 3000); //3 second delay on account creation
});
