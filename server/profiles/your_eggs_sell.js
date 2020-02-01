const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourEggs } = require('../reusable.js');
const { getYourProfile } = require('./your_profile.js');

const species = require('../gameplay/species.json');

const apiYourEggsSell = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(determineSelectedEgg)
		.then(addCoins)
		.then(sellEgg)
		.then(getYourEggs)
		.then(getYourProfile)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//TODO: move this to reusable
const determineSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(egg => egg ? resolve({ egg, ...fields }) : reject({ msg: 'egg not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedEgg error', extra: e }))
	;
});

const addCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins + ? WHERE id = ?;';
	return pool.promise().query(query, [species[fields.egg.species].egg.value / 2, fields.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'addCoins error', extra: e }))
	;
});

const sellEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM creatureEggs WHERE id = ?;';
	return pool.promise().query(query, [fields.egg.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'sellEgg error', extra: e }))
	;
});

module.exports = {
	apiYourEggsSell,

	//for testing
	determineSelectedEgg,
	addCoins,
	sellEgg,
};