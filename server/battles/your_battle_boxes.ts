import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { countTotalBattleBoxItems, getBattleBoxes } from './battle_tools';

import species from '../gameplay/species.json';

export const apiYourBattleBoxes = (req, res) => {
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
		.then((fields: any) => { return { msg: { battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const getBattleBoxStructure = (fields) => new Promise(async (resolve, reject) => {
	//curry these two functions
	await new Promise((resolve, reject) => resolve(fields))
		.then(getAllOfYourBattleBoxSlots)
		.then(processBattleBoxSlots)
		.then(fields => resolve(fields))
		.catch(e => reject({ msg: 'getBattleBoxStructure error', extra: e }))
	;
});

export const getAllOfYourBattleBoxSlots = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM battleBoxSlots WHERE battleBoxId IN (SELECT id FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?)) ORDER BY battleBoxId;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(slots => resolve({ ...fields, slots })) //WARNING: field hiding is deliberate
		.catch(e => reject({ msg: 'getAllOfYourBattleBoxSlots error', extra: e }))
	;
});

export const processBattleBoxSlots = (fields) => new Promise(async (resolve, reject) => {
	const battleBoxes = await getBattleBoxes(fields.id);

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

	structure = await structure.reduce((acc, slot) => {
		acc[slot.battleBoxIndex] = acc[slot.battleBoxIndex] || {};
		acc[slot.battleBoxIndex].meta = acc[slot.battleBoxIndex].meta || {};
		acc[slot.battleBoxIndex].content = acc[slot.battleBoxIndex].content || [];

		acc[slot.battleBoxIndex].meta.locked = !!battleBoxes[slot.battleBoxIndex].locked;

		acc[slot.battleBoxIndex].content[slot.boxSlot] = { name: slot.name, frontImage: slot.frontImage, boxSlot: slot.boxSlot }

		return acc;
	}, new Array(await countTotalBattleBoxItems(fields.id)));

	return resolve({ ...fields, structure }); //WARNING: field hiding is deliberate
});
