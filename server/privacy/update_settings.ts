//environment variables
require('dotenv').config();

//utilities
import { log } from '../utilities/logging';
import formidablePromise from '../utilities/formidable_promise';
import pool from '../utilities/database';

import { validateSession } from '../reusable';
import { sendPrivacySettings } from './settings';

export const apiUpdateSettings = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
//		res.status(200).json(obj);
		res.end();
	};

	return formidablePromise(req)
		.then(({fields}) => fields)
		.then(validateSession)
		.then(updatePrivacySettings)
		.then(sendPrivacySettings(res))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const updatePrivacySettings = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET promotions = ? WHERE id = ?;';

	return pool.promise().query(query, [fields.promotions ? true : false, fields.id])
		.then((results: any) => results[0].affectedRows > 0 ? resolve(fields) : reject({ msg: 'updatePrivacySettings error', extra: 'affected rows = 0' }))
		.catch(e => reject({ msg: 'updatePrivacySettings error', extra: e }))
	;
});
