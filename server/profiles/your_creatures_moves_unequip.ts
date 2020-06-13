import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession, determineSelectedCreature, getCreatureMoves } from '../reusable';

import species from '../gameplay/species.json';
import moves from '../gameplay/moves.json';

export const apiYourCreaturesMovesUnequip = (req, res) => {
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
		.then(checkForSelectedMoveOwned)
		.then(unequipSelectedMove)
		.then(getCreatureMoves)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//WARNING: duplication-ish
export const checkForSelectedMoveOwned = (fields) => new Promise((resolve, reject) => {
	if (!species[fields.creature.species].moves.includes(fields.move)) {
		return reject({ msg: `The creature ${fields.creature.species} can't learn the move ${fields.move}.`, extra: '' });
	}

	const checkQuery = 'SELECT COUNT(*) AS total FROM creatureMovesOwned WHERE creatureId = ? AND idx = ?;';
	return pool.promise().query(checkQuery, [fields.creature.id, fields.move])
		.then(results => results[0][0].total)
		.then(total => total > 0 ? resolve(fields) : reject({ msg: 'This creature doesn\'t know that move', extra: '' }))
		.catch(e => reject({ msg: 'checkForSelectedMoveOwned error', extra: e }))
	;
});

export const unequipSelectedMove = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatureMovesOwned SET equipped = FALSE WHERE creatureId = ? AND idx = ?;';
	return pool.promise().query(query, [fields.creature.id, fields.move])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'buySelectedMove error', extra: e }))
	;
});
