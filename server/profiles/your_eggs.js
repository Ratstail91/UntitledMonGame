const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateCredentials } = require('./your_profile.js');

const species = require('../gameplay/species.json');

const apiYourEggs = async (req, res) => {
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
		.then(validateCredentials)
		.then(getYourEggs)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getYourEggs = (accountId) => new Promise((resolve, reject) => {
	const query = 'SELECT species FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?);';
	return pool.promise().query(query, [accountId])
		.then(results => results[0])
		.then(eggs => resolve({ msg: eggs.map(egg => { return { id: egg.id, element: species[egg.species].element }}), extra: eggs.length }))
		.catch(e => reject({ msg: 'getYourEggs error', extra: e }))
	;
});

module.exports = {
	apiYourEggs,

	//for testing
	validateCredentials,
	getYourEggs,
};