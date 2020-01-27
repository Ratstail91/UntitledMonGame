const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../accounts/sessions.js');
const { getYourProfile } = require('../profiles/your_profile.js');

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

	return new Promise((resolve, reject) => resolve({ fields: req.body }))
		.then(validateSession)
		.then(fetchProfileId)
		.then(determineSelectedEgg)
		.then(addCoins)
		.then(sellEgg)
		.then(getYourProfile)
		.then(getYourEggs2)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const fetchProfileId = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id FROM profiles WHERE accountId = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].id)
		.then(profileId => resolve({ ...fields, profileId }))
		.catch(e => reject({ msg: 'fetchProfileId error', extra: e }))
	;
});

const determineSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(egg => resolve({ egg, ...fields }) ? egg : reject({ msg: 'egg not found', extra: fields.index }))
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
		.then(results => resolve(fields.id))
		.catch(e => reject({ msg: 'sellEgg error', extra: e }))
	;
});

//WARNING: duplicate
const getYourEggs2 = ({ msg }) => new Promise((resolve, reject) => {
	const query = 'SELECT id, species FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [msg.id])
		.then(results => results[0])
		.then(eggs => resolve({ msg: eggs.map(egg => { return { id: egg.id, element: species[egg.species].element }}), extra: eggs.length }))
		.catch(e => reject({ msg: 'getYourEggs2 error', extra: e }))
	;
});

module.exports = {
	apiYourEggsSell,

	//for testing
	fetchProfileId,
	determineSelectedEgg,
	addCoins,
	sellEgg,
	getYourEggs2
};