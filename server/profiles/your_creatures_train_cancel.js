const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourCreatures, determineSelectedCreature } = require('../reusable.js');

const apiYourCreaturesTrainCancel = async (req, res) => {
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
		.then(determineSelectedCreature)
		.then(cancelTrainSelectedCreature)
		.then(getYourCreatures)
		.then(fields => { return { msg: { creatures: fields.creatures }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const cancelTrainSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET trainingTime = NULL WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'cancelTrainSelectedCreature error', extra: '' }))
	;
});

module.exports = {
	apiYourCreaturesTrainCancel,

	//for testing
	cancelTrainSelectedCreature,
};