const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const species = require('../gameplay/species.json');

const apiYourCreatures = async (req, res) => {
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
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//NOTE: for display only
const getYourCreatures = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(creatures => resolve({ creatures: creatures.map(creature => {
			return {
				id: creature.id,
				species: creature.species,
				name: species[creature.species].name,
				element: species[creature.species].element,
				description: species[creature.species].description,
				frontImage: species[creature.species].frontImage,
			}
		}), ...fields }))
		.catch(e => reject({ msg: 'getYourCreatures error', extra: e }))
	;
});

module.exports = {
	apiYourCreatures,

	//for testing
	getYourCreatures
};
//TODO: implement nicknames