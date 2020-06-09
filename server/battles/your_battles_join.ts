import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { validateSession } from '../reusable';
import { countTotalBattleBoxItems, getBattleBoxes, getBattleBoxSlots, activateFirstTwoSlots, initializeBattleBox } from './battle_tools';

export const apiYourBattlesJoin = async (req, res) => {
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
		.then(joinBattle)
		.then(fields => { return { msg: { msg: 'Success' }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const joinBattle = (fields) => new Promise(async (resolve, reject) => {
	if (!fields.inviteCode) {
		return reject({ msg: 'No invite code', extra: '' });
	}

	const battleBoxes = await getBattleBoxes(fields.id);

	//bounds check
	const totalBattleBoxItems = countTotalBattleBoxItems(fields.id);
	if (fields.index < 0 || totalBattleBoxItems <= fields.index) {
		return reject({ msg: 'Couldn\'t find that battle box', extra: [totalBattleBoxItems, fields.index] });
	}

	//is locked
	if (!battleBoxes[fields.index].locked) {
		return reject({ msg: 'Can only battle with a locked box', extra: fields.index });
	}

	if (battleBoxes[fields.index].battleId) {
		return reject({ msg: 'Can only battle with a free box', extra: fields.index });
	}

	//does this battle exist already?
	const battle = (await pool.promise().query('SELECT * FROM battles WHERE inviteCode = ?;', [fields.inviteCode]))[0][0];

	if (!battle) {
		return reject({ msg: 'This battle doesn\'t exist!', extra: fields.inviteCode });
	}

	if (battleBoxes.some(bb => bb.battleId == battle.id)) {
		return reject({ msg: 'You can\'t battle yourself!', extra: fields.inviteCode });
	}

	//update battle box
	await pool.promise().query('UPDATE battleBoxes SET battleId = ? WHERE id = ?;', [battle.id, battleBoxes[fields.index].id]);

	//set the first two creatures to be "active"
	await activateFirstTwoSlots(battleBoxes[fields.index].id);
	await initializeBattleBox(battleBoxes[fields.index].id);

	//update the battle
	await pool.promise().query('UPDATE battles SET inviteCode = NULL, status = "inProgress" WHERE id = ?;', [battle.id]);

	//join with the invite code
	return resolve(fields);
});
