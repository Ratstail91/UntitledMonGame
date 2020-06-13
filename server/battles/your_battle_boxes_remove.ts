import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { getYourCreatures } from '../reusable';
import { getBattleBoxes } from './battle_tools';

import { getBattleBoxStructure } from './your_battle_boxes';

export const apiYourBattleBoxesRemove = (req, res) => {
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
		.then(removeFromBattleBox)
		.then(getBattleBoxStructure)
		.then(getYourCreatures)
		.then((fields: any) => { return { msg: { creatures: fields.creatures, battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const removeFromBattleBox = (fields) => new Promise(async (resolve, reject) => {
	let battleBoxes = await getBattleBoxes(fields.id);

	if (battleBoxes[fields.index.box] && battleBoxes[fields.index.box].locked) {
		return reject({ msg: 'Can\'t remove from a locked box', extra: '' });
	}

	const query = 'DELETE FROM battleBoxSlots WHERE battleBoxId = ? AND boxSlot = ?;';
	return pool.promise().query(query, [battleBoxes[fields.index.box].id, fields.index.slot])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'removeFromBattleBox error', extra: e }))
	;
});
