const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');
const { getYourProfile } = require('../profiles/your_profile.js');

const species = require('../gameplay/species.json');

const apiShopEggsBuy = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, /* obj.extra.toString() */));
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
		.then(checkCoins)
		.then(subtractCoins)
		.then(fetchProfileId)
		.then(buySelectedEgg)
		.then(getYourProfile)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const determineSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM shopEggs WHERE shopSlot = ?;';
	return pool.promise().query(query, [fields.index])
		.then(results => results[0].length == 1 ? resolve({ ...fields, egg: results[0][0] }) : reject({ msg: 'determineSelectedEgg error', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedEgg error', extra: e }))
	;
});

const checkCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT coins FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].coins >= species[fields.egg.species].egg.value ? resolve(fields) : reject({ msg: 'Not enough coins', extra: results[0][0].coins }))
		.catch(e => reject({ msg: 'checkCoins error', extra: e }))
	;
});

const subtractCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins - ? WHERE id = ?;';
	return pool.promise().query(query, [species[fields.egg.species].egg.value, fields.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'subtractCoins error', extra: e }))
	;
});

const fetchProfileId = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id FROM profiles WHERE accountId = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].id)
		.then(profileId => resolve({ ...fields, profileId }))
		.catch(e => reject({ msg: 'fetchProfileId error', extra: e }))
	;
});

const buySelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'INSERT INTO creatureEggs (profileId, species, geneticPointsHealth, geneticPointsSpeed, geneticPointsStrength, geneticPointsPower) VALUES (?, ?, ?, ?, ?, ?);';
	return pool.promise().query(query, [
		fields.profileId,
		fields.egg.species,
		fields.egg.geneticPointsHealth ? fields.egg.geneticPointsHealth : Math.floor(Math.random() * 16),
		fields.egg.geneticPointsSpeed ? fields.egg.geneticPointsSpeed : Math.floor(Math.random() * 16),
		fields.egg.geneticPointsStrength ? fields.egg.geneticPointsStrength : Math.floor(Math.random() * 16),
		fields.egg.geneticPointsPower ? fields.egg.geneticPointsPower : Math.floor(Math.random() * 16),
		])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'buySelectedEgg error', extra: e }))
	;
});

module.exports = {
	apiShopEggsBuy,

	//for testing
	determineSelectedEgg,
	checkCoins,
	subtractCoins,
	fetchProfileId,
	buySelectedEgg,
};
