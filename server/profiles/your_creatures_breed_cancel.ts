import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession, determineSelectedCreature, getYourCreatures } from '../reusable';

export const apiYourCreaturesBreedCancel = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(determineSelectedCreature)
		.then(cancelBreedSelectedCreature)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const cancelBreedSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET breeding = FALSE WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'cancelBreedSelectedCreature error', extra: e }))
	;
});
