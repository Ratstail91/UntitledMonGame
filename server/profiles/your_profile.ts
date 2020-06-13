import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession } from '../reusable';

export const apiYourProfile = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(getYourProfile)
		.then(profile => { return { msg: profile, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const getYourProfile = (fields) => new Promise((resolve, reject) => {
	//TODO: send creatures
	const query = 'SELECT username, coins FROM accounts WHERE id = ?;'; //TODO: join with profile for more stuff
	return pool.promise().query(query, [fields.id])
		.then(result => result[0][0])
		.then(record => record ? resolve({profile: record, ...fields}) : reject({ msg: 'Failed to find profile records', extra: fields.id }))
		.catch(e => reject({ msg: 'getYourProfile error', extra: e }))
	;
});
