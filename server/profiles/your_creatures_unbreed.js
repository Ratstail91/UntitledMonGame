const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, determineSelectedCreature, getYourCreatures } = require('../reusable.js');

const apiYourCreaturesUnbreed = async (req, res) => {
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
		.then(determineSelectedCreature)
		.then(markAsNotBreeding)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const markAsNotBreeding = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET breeding = FALSE WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'markAsNotBreeding error', extra: e }))
	;
});

module.exports = {
	apiYourCreaturesUnbreed,

	//for testing
	markAsNotBreeding,
};
