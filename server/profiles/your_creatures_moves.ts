import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession, determineSelectedCreature, getCreatureMoves } from '../reusable';

import species from '../gameplay/species.json';
import moves from '../gameplay/moves.json';

export const apiYourCreaturesMoves = (req, res) => {
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
		.then(getCreatureMoves)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};
