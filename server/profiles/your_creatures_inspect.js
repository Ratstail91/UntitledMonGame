const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, determineSelectedCreature } = require('../reusable.js');

const species = require('../gameplay/species.json');

const apiYourCreaturesInspect = async (req, res) => {
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
		.then(checkForMagnifyingGlass)
		.then(determineSelectedCreature)
		.then(fields => { return { msg: { creature: fields.creature, species: species[fields.creature.species] }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkForMagnifyingGlass = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = ?;';
	return pool.promise().query(query, [fields.id, 'magnifyingglass'])
		.then(results => results[0][0].total)
		.then(total => total > 0 ? resolve(fields) : reject({ msg: 'You need a Magnifying Glass to do this', extra: total }))
		.catch(e => reject({ msg: 'checkForMagnifyingGlass error', extra: e }))
	;
});

module.exports = {
	apiYourCreaturesInspect,

	//for testing
	checkForMagnifyingGlass,
};