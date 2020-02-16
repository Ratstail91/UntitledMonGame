const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const { getYourBattles } = require('./your_battles.js');

const apiYourBattlesResign = async (req, res) => {
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
		.then(getYourBattles)
		.then(resignFromBattle)
		.then(getYourBattles)
		.then(fields => { return { msg: { battles: fields.battles }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const resignFromBattle = (fields) => new Promise(async (resolve, reject) => {
	//TODO: mark battle as won for the other player
	return pool.promise().query('UPDATE battleBoxes SET battleId = NULL WHERE battleId = ? AND profileId IN (SELECT id FROM profiles WHERE accountId = ?);', [fields.battles[fields.index].id, fields.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'resignFromBattle error', extra: e }))
	;
});

module.exports = {
	apiYourBattlesResign,

	//for testing
	resignFromBattle,
};