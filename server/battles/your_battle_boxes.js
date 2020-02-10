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
		.then(countTotalBattleBoxObjects)
		.then(getYourBattleBoxSlots)
		.then(processBattleBoxSlots)
		.then(fields => { return { msg: { battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//NOTE: reusable
const countTotalBattleBoxObjects = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = ?;';
	return pool.promise().query(query, [fields.id, 'battlebox'])
		.then(results => results[0][0].total)
		.then(total => resolve({ totalBattleBoxes: total, ...fields }))
		.catch(e => reject({ msg: 'countTotalBattleBoxObjects error', extra: e }))
	;
});

const getYourBattleBoxSlots = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM battleBoxSlots WHERE battleBoxId IN (SELECT id FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?)) ORDER BY battleBoxId;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(slots => resolve({ ...fields, slots })) //WARNING: field hiding is deliberate
		.catch(e => reject({ msg: 'getYourBattleBoxSlots error', extra: e }))
	;
});

const processBattleBoxSlots = (fields) => new Promise(async (resolve, reject) => {
	const battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [fields.id]))[0];

	let structure = fields.slots
	.map(async slot => {
		const creatureRecord = (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', slot.creatureId))[0][0];

		return {
			battleBoxIndex: battleBoxes.reduce((acc, bb, index) => bb.id == slot.battleBoxId ? index : acc, -1),
			boxSlot: slot.boxSlot,

			frontImage: species[creatureRecord.species].frontImage,
			name: creatureRecord.nickname || species[creatureRecord.species].name
		};
	});

	structure = (await Promise.all(structure));
	structure = structure.reduce((acc, slot) => {
		acc[slot.battleBoxIndex] = acc[slot.battleBoxIndex] || [];
		acc[slot.battleBoxIndex][slot.boxSlot] = { name: slot.name, frontImage: slot.frontImage, boxSlot: slot.boxSlot }
		return acc;
	}, new Array(fields.totalBattleBoxes));

	return resolve({ ...fields, structure }); //WARNING: field hiding is deliberate
});

module.exports = {
	apiYourBattleBoxes,

	//for testing
	countTotalBattleBoxObjects,
	getYourBattleBoxSlots,
	processBattleBoxSlots,
};