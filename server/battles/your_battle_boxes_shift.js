const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const { countTotalBattleBoxObjects, getBattleBoxStructure, getBattleBoxes } = require('./your_battle_boxes.js');

const apiYourBattleBoxesShift = async (req, res) => {
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
		.then(switchBattleBoxSlots)
		.then(getBattleBoxStructure)
		.then(fields => { return { msg: { battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const switchBattleBoxSlots = (fields) => new Promise(async (resolve, reject) => {
	//determine the actual values of each box to switch
	let aBoxIndex = fields.index.box;
	let aBoxSlot = fields.index.slot;

	let bBoxIndex = fields.index.box;
	let bBoxSlot = fields.index.slot + fields.index.direction;

	while (bBoxSlot < 0) {
		bBoxIndex--;
		bBoxSlot += 6;
	}

	while (bBoxSlot >= 6) {
		bBoxIndex++;
		bBoxSlot -= 6;
	}

	//bounds check
	if (aBoxIndex >= fields.totalBattleBoxes || bBoxIndex >= fields.totalBattleBoxes || aBoxIndex < 0 || bBoxIndex < 0) {
		return resolve(fields); //silently ignore it
	}

	//get the battleboxes
	let battleBoxes = await getBattleBoxes(fields);

	if (battleBoxes[aBoxIndex] && battleBoxes[aBoxIndex].locked) {
		return reject({ msg: 'Can\'t move inside a locked box', extra: '' });
	}

	//move AROUND the locked boxes
	while (battleBoxes[bBoxIndex] && battleBoxes[bBoxIndex].locked) {
		bBoxIndex += Math.sign(fields.index.direction);
	}

	if (!battleBoxes[bBoxIndex]) {
		return resolve(fields); //silently ignore it
	}

	let slots = (await pool.promise().query('SELECT * FROM battleBoxSlots WHERE battleBoxId IN (SELECT id FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?));', [fields.id]))[0];

	let aSlot = slots.filter((s, idx) => s.battleBoxId == battleBoxes[aBoxIndex].id && s.boxSlot == aBoxSlot)[0];
	let bSlot = slots.filter((s, idx) => s.battleBoxId == battleBoxes[bBoxIndex].id && s.boxSlot == bBoxSlot)[0];

	if (aSlot) {
		await pool.promise().query('UPDATE battleBoxSlots SET battleBoxId = ?, boxSlot = ? WHERE id = ?;', [battleBoxes[bBoxIndex].id, bBoxSlot, aSlot.id]);
	}

	if (bSlot) {
		await pool.promise().query('UPDATE battleBoxSlots SET battleBoxId = ?, boxSlot = ? WHERE id = ?;', [battleBoxes[aBoxIndex].id, aBoxSlot, bSlot.id]);
	}

	return resolve(fields);
});

module.exports = {
	apiYourBattleBoxesShift,

	//for testing
	switchBattleBoxSlots,
};