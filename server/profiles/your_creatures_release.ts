import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { determineSelectedCreature, getYourCreatures } from '../reusable';

export const apiYourCreaturesRelease = (req, res) => {
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
		.then(determineSelectedCreature)
		.then(releaseSelectedCreature)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const releaseSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM creatures WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'releaseSelectedCreature error', extra: e }))
	;
});
