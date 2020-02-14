const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const { countTotalBattleBoxObjects, getBattleBoxes } = require('./your_battle_boxes.js');

const { getYourBattles } = require('./your_battles.js');

const apiYourBattlesJoin = async (req, res) => {
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
		.then(joinBattle)
		.then(fields => { return { msg: { msg: 'Success' }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const joinBattle = (fields) => new Promise(async (resolve, reject) => {
	const battleBoxes = await getBattleBoxes(fields);

	//bounds check
	if (fields.index < 0 || fields.totalBattleBoxes <= fields.index) {
		return reject({ msg: 'Couldn\'t find that battle box', extra: [fields.totalBattleBoxes, fields.index] });
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

	//send the invite code
	return resolve(fields);
});

module.exports = {
	apiYourBattlesJoin,

	//for testing
	joinBattle,
};