import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession, getYourCreatures, determineSelectedCreature } from '../reusable';

export const apiYourCreaturesTrainCancel = (req, res) => {
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
		.then(determineSelectedCreature)
		.then(cancelTrainSelectedCreature)
		.then(getYourCreatures)
		.then((fields: any) => { return { msg: { creatures: fields.creatures }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const cancelTrainSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET trainingTime = NULL WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'cancelTrainSelectedCreature error', extra: '' }))
	;
});
