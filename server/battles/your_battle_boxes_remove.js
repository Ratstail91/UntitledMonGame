const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourCreatures } = require('../reusable.js');
const { getBattleBoxes } = require('./battle_tools.js');

const { getBattleBoxStructure } = require('./your_battle_boxes.js');

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
		.then(removeFromBattleBox)
		.then(getBattleBoxStructure)
		.then(getYourCreatures)
		.then(fields => { return { msg: { creatures: fields.creatures, battleBoxes: fields.structure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const removeFromBattleBox = (fields) => new Promise(async (resolve, reject) => {
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

module.exports = {
	apiYourBattleBoxesRemove,

	//for testing
	removeFromBattleBox,
};