const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

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
		.then(validateSession)
		.then(getYourEggs)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getYourEggs = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id, species FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(eggs => resolve({ eggs: eggs.map(egg => { return { id: egg.id, element: species[egg.species].element }}), ...fields }))
		.catch(e => reject({ msg: 'getYourEggs error', extra: e }))
	;
});

module.exports = {
	apiYourEggs,

	//for testing
	getYourEggs,
};