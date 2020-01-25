const { log } = require('../utilities/logging.js');

const elements = require('./elements.json');
const moves = require('./moves.json');
const species = require('./species.json');

const apiCreature = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
	}

	//pass the process along
	return getInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (req.query.species && species[req.query.species]) {
		const result = {};

		result[req.query.species] = species[req.query.species];

		return resolve({ msg: result, extra: req.query.species });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

module.exports = {
	apiCreature,

	//for testing
	getInformationFromJSON,
};