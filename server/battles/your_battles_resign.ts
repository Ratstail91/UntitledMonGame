import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession } from '../reusable';

import { getYourBattles } from './your_battles';

export const apiYourBattlesResign = (req, res) => {
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
		.then(getYourBattles)
		.then(resignFromBattle)
		.then(getYourBattles)
		.then((fields: any) => { return { msg: { battles: fields.battleStructure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const resignFromBattle = (fields) => new Promise(async (resolve, reject) => {
	//TODO: mark battle as won for the other player
	await pool.promise().query('UPDATE battleBoxes SET battleId = NULL WHERE battleId = ? AND profileId IN (SELECT id FROM profiles WHERE accountId = ?);', [fields.battleStructure[fields.index].id, fields.id]);
	await pool.promise().query('UPDATE battles SET status = "completed" WHERE id = ?;', fields.battleStructure[fields.index].id);

	return resolve(fields);
});
