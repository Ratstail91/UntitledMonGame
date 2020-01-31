const { log } = require('../utilities/logging.js');

const elements = require('./elements.json');
const moves = require('./moves.json');
const species = require('./species.json');
const itemIndex = require('./item_index.json');

//TODO: elements and moves

//creatures
const apiCreatures = async (req, res) => {
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
	return getCreatureInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getCreatureInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (req.query.species && species[req.query.species]) {
		const result = {};

		result[req.query.species] = species[req.query.species];

		return resolve({ msg: result, extra: req.query.species });
	}

	if (!req.query.species) {
		return resolve({ msg: species, extra: '' });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

//items
const apiItems = async (req, res) => {
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
	return getItemInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getItemInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (req.query.item && itemIndex[req.query.item]) {
		const result = {};

		result[req.query.item] = itemIndex[req.query.item];

		return resolve({ msg: result, extra: req.query.item });
	}

	if (!req.query.item) {
		return resolve({ msg: itemIndex, extra: '' });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

//TODO: expose premiums, moves, etc. here

module.exports = {
	apiCreatures,
	apiItems,

	//for testing
	getCreatureInformationFromJSON,
	getItemInformationFromJSON,
};