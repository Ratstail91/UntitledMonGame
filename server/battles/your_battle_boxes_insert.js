const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourCreatures, determineSelectedCreature } = require('../reusable.js');

const { countTotalBattleBoxObjects, getBattleBoxStructure, getBattleBoxes } = require('./your_battle_boxes.js');

const apiYourBattleBoxesInsert = async (req, res) => {
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
		.then(determineSelectedCreature)
		.then(getBattleBoxStructure)

		.then(insertIntoBattleBoxes)

		.then(getBattleBoxStructure)
		.then(getYourCreatures)

		.then(fields => { return { msg: { creatures: fields.creatures, battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const insertIntoBattleBoxes = (fields) => new Promise(async (resolve, reject) => {
	if (fields.creature.breeding) {
		return reject({ msg: 'Can\'t battle with a breeding creature', extra: [fields.creature.id] })
	}

	if (fields.creature.trainingTime) {
		return reject({ msg: 'Can\'t battle with a training creature', extra: [fields.creature.id] })
	}

	//get the battleboxes
	let battleBoxes = await getBattleBoxes(fields);

	let box = null;
	let slot = null;

outer:
	for (let i = 0; i < fields.totalBattleBoxes; i++) {
		if (battleBoxes[i] && battleBoxes[i].locked) {
			continue;
		}

		if (!fields.structure[i]) {
			box = i;
			slot = 0;
			break;
		}

		for (let j = 0; j < 6; j++) {
			if (!fields.structure[i].content[j]) {
				box = i;
				slot = j;
				break outer;
			}
		}
	}

	if (box === null) {
		return reject({ msg: 'Your Battle Boxes Are Full', extra: [box] });
	}

	//insert into battle box slots
	const query = 'INSERT INTO battleBoxSlots (battleBoxId, boxSlot, creatureId) VALUES (?, ?, ?);';
	await pool.promise().query(query, [battleBoxes[box].id, slot, fields.creature.id]);

	return resolve(fields);
});

module.exports = {
	apiYourBattleBoxesInsert,

	//for testing
	insertIntoBattleBoxes,
};