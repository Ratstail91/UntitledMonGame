//environment variables
require('dotenv').config();

//utilities
import { log } from '../utilities/logging';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

import { validateSession } from '../reusable';

export const apiSettings = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
//		res.status(200).json(obj);
		res.end();
	};

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(sendPrivacySettings(res))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const sendPrivacySettings = (res) => (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => res.status(200).json({ promotions: results[0][0].promotions }))
		.then(() => resolve({ msg: 'Sent privacy settings', extra: [fields.id] }))
		.catch(e => reject({ msg: 'sendPrivacySettings error', extra: e }))
	;
});
