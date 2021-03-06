import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { getBattleBoxes } from './battle_tools';

import { getBattleBoxStructure } from './your_battle_boxes';

export const apiYourBattleBoxesLockToggle = (req, res) => {
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
		.then(getBattleBoxStructure)

		.then(toggleBattleBoxLock)

		.then(getBattleBoxStructure)

		.then((fields: any) => { return { msg: { battleBoxes: fields.structure }, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const toggleBattleBoxLock = (fields) => new Promise(async (resolve, reject) => {
	if (!fields.structure[fields.index.box]) {
		return reject({ msg: 'Can\'t lock an empty box', extra: '' });
	}

	let battleBoxes = await getBattleBoxes(fields.id);

	//check for in-battle status
	const battleId = (await pool.promise().query('SELECT battleId FROM battleBoxes WHERE id = ?;', battleBoxes[fields.index.box].id))[0][0].battleId;

	if (battleId) {
		return reject({ msg: 'Can\'t toggle a box in battle! Resign from that battle first.', extra: '' });
	}

	//update
	const query = 'UPDATE battleBoxes SET locked = ? WHERE id = ?;';
	return pool.promise().query(query, [!battleBoxes[fields.index.box].locked, battleBoxes[fields.index.box].id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'toggleBattleBoxLock error', extra: e }))
	;
});
