import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { determineSelectedCreature } from '../reusable';

import species from '../gameplay/species.json';

export const apiYourCreaturesInspect = (req, res) => {
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
		.then(checkForMagnifyingGlass)
		.then(determineSelectedCreature)
		.then((fields: any) => { return { msg: { creature: fields.creature, species: species[fields.creature.species] }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const checkForMagnifyingGlass = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = ?;';
	return pool.promise().query(query, [fields.id, 'magnifyingglass'])
		.then(results => results[0][0].total)
		.then(total => total > 0 ? resolve(fields) : reject({ msg: 'You need a Magnifying Glass to do this', extra: total }))
		.catch(e => reject({ msg: 'checkForMagnifyingGlass error', extra: e }))
	;
});
