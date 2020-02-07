const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const species = require('../gameplay/species.json');

const apiYourBattleBoxes = async (req, res) => {
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
		.then(getYourBattleBoxSlots)
		.then(processBattleBoxSlots)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getYourBattleBoxSlots = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM battleBoxSlots WHERE battleBoxId IN (SELECT id FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?)) ORDER BY battleBoxId;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(slots => resolve({ slots, ...fields }))
		.catch(e => reject({ msg: 'getYourBattleBoxSlots error', extra: e }))
	;
});

const processBattleBoxSlots = (fields) => new Promise(async (resolve, reject) => {
	let structure = fields.slots
	.map(async slot => {
		const creatureRecord = (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', slot.creatureId))[0][0];

		return {
			battleBoxId: slot.battleBoxId,
			boxSlot: slot.boxSlot,

			frontImage: species[creatureRecord.species].frontImage,
			name: creatureRecord.nickname || species[creatureRecord.species].name
		};
	});

	structure = (await Promise.all(structure));

	structure = structure.reduce((acc, slot) => {
		acc[slot.battleBoxId] = acc[slot.battleBoxId] || [];
		acc[slot.battleBoxId][slot.boxSlot] = { name: slot.name, frontImage: slot.frontImage }
		return acc;
	}, []);

	resolve(structure);
});

module.exports = {
	apiYourBattleBoxes,

	//for testing
	getYourBattleBoxSlots,
	processBattleBoxSlots,
};