const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const { countTotalBattleBoxObjects, getYourBattleBoxSlots, processBattleBoxSlots } = require('./your_battle_boxes.js');

const apiYourBattleBoxesLock = async (req, res) => {
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

		.then(getYourBattleBoxSlots)
		.then(processBattleBoxSlots)

		.then(toggleBattleBoxLock)

		.then(getYourBattleBoxSlots)
		.then(processBattleBoxSlots)

		.then(fields => { return { msg: { battleBoxes: fields.structure }, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const toggleBattleBoxLock = (fields) => new Promise(async (resolve, reject) => {
	if (!fields.structure[fields.index.box]) {
		return reject({ msg: 'Can\'t lock an empty box', extra: '' });
	}

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

	//update
	const query = 'UPDATE battleBoxes SET locked = ? WHERE id = ?;';

	return pool.promise().query(query, [!battleBoxes[fields.index.box].locked, battleBoxes[fields.index.box].id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'toggleBattleBoxLock error', extra: e }))
	;
});

module.exports = {
	apiYourBattleBoxesLock,

	//for testing
	toggleBattleBoxLock,
};