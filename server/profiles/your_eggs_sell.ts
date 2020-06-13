import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { determineSelectedEgg, getYourEggs } from '../reusable';
import { getYourProfile } from './your_profile';

import species from '../gameplay/species.json';

export const apiYourEggsSell = (req, res) => {
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
		.then(determineSelectedEgg)
		.then(addCoins)
		.then(sellEgg)
		.then(getYourEggs)
		.then(getYourProfile)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const addCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins + ? WHERE id = ?;';
	return pool.promise().query(query, [species[fields.egg.species].egg.value / 2, fields.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'addCoins error', extra: e }))
	;
});

export const sellEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM creatureEggs WHERE id = ?;';
	return pool.promise().query(query, [fields.egg.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'sellEgg error', extra: e }))
	;
});
