const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const apiYourBattles = async (req, res) => {
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
		.then(fields => { return { msg: { battles: fields.battleStructure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//TODO: (0) reusable?
const getYourBattles = (fields) => new Promise(async (resolve, reject) => {
	const battleQuery = 'SELECT * FROM battles WHERE id IN (SELECT battleId FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?))';
	const battles = (await pool.promise().query(battleQuery, [fields.id]))[0];

	let battleStructure = battles; //TMP

	return resolve({ ...fields, battleStructure });
});

module.exports = {
	apiYourBattles,
	getYourBattles,

	//for testing
	//
};