import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { countTotalBattleBoxItems, getBattleBoxes, activateFirstTwoSlots, initializeBattleBox } from './battle_tools';

export const apiYourBattlesInvite = (req, res) => {
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
		.then(generateNewBattle)
		.then((fields: any) => { return { msg: { inviteCode: fields.inviteCode }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const generateNewBattle = (fields) => new Promise(async (resolve, reject) => {
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

	//does this battle exist already?
	const battle = (await pool.promise().query('SELECT * FROM battles WHERE id = ?;', [battleBoxes[fields.index].battleId]))[0][0];

	if (battle) {
		//count the number of people in this battle
		const total = (await pool.promise().query('SELECT COUNT(*) AS total FROM battleBoxes WHERE battleId = ?;', battle.id))[0][0].total;

		if (total > 1) {
			return reject({ msg: 'You can\'t use the same box in more than one battle!', extra: '' });
		}

		//delete existing battle objects
		await pool.promise().query('UPDATE battleBoxes SET battleId = NULL WHERE battleId = ?;', [battle.id]);
		await pool.promise().query('DELETE FROM battles WHERE id = ?;', [battle.id]);
	}

	//generate a random number as a token
	const rand = Math.floor(Math.random() * 2000000000);

	//create the battle object
	await pool.promise().query('INSERT INTO battles (inviteCode, status) VALUES (?, "open");', [rand]);
	const newBattle = (await pool.promise().query('SELECT * FROM battles WHERE inviteCode = ?;', [rand]))[0][0];

	//update battle box
	await pool.promise().query('UPDATE battleBoxes SET battleId = ? WHERE id = ?;', [newBattle.id, battleBoxes[fields.index].id]);

	await activateFirstTwoSlots(battleBoxes[fields.index].id);
	await initializeBattleBox(battleBoxes[fields.index].id);

	//send the invite code
	return resolve({ fields, inviteCode: rand });
});
