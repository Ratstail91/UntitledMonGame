const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourCreatures } = require('../reusable.js');

const { countTotalBattleBoxObjects, getYourBattleBoxSlots, processBattleBoxSlots } = require('./your_battle_boxes.js');

const apiYourBattleBoxesRemove = async (req, res) => {
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
		.then(countTotalBattleBoxObjects)
		.then(removeFromBattleBox)
		.then(getYourBattleBoxSlots)
		.then(processBattleBoxSlots)
		.then(getYourCreatures)
		.then(fields => { return { msg: { creatures: fields.creatures, battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const removeFromBattleBox = (fields) => new Promise(async (resolve, reject) => {
	let battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [fields.id]))[0];

	//if there are more item battleboxes than DB battle boxes
	//TODO: make this reusable?
	if (battleBoxes.length != fields.totalBattleBoxes) {
		const query = 'INSERT INTO battleBoxes (profileId) VALUES ((SELECT id FROM profiles WHERE accountId = ?));';
		for (let i = 0; i < fields.totalBattleBoxes - battleBoxes.length; i++) {
			await pool.promise().query(query, [fields.id]);
		}

		//grab new battleboxes
		battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [fields.id]))[0];
	}

	if (battleBoxes[fields.index.box] && battleBoxes[fields.index.box].locked) {
		return reject({ msg: 'Can\'t remove from a locked box', extra: '' });
	}

	const query = 'DELETE FROM battleBoxSlots WHERE battleBoxId = ? AND boxSlot = ?;';
	return pool.promise().query(query, [battleBoxes[fields.index.box].id, fields.index.slot])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'removeFromBattleBox error', extra: e }))
	;
});

module.exports = {
	apiYourBattleBoxesRemove,

	//for testing
	removeFromBattleBox,
};