const { log } = require('../utilities/logging.js');

const species = require('./species.json');
const itemIndex = require('./item_index.json');
const premiumIndex = require('./premium_index.json');
const moves = require('./moves.json');
const elements = require('./elements.json');

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
	if (req.query.creature && species[req.query.creature]) {
		const result = {};

		result[req.query.species] = species[req.query.creature];

		return resolve({ msg: result, extra: req.query.creature });
	}

	if (!req.query.creature) {
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
	if (req.query.item && (itemIndex[req.query.item] || premiumIndex[req.query.item])) {
		const result = {};

		result[req.query.item] = itemIndex[req.query.item] || premiumIndex[req.query.item];

		return resolve({ msg: result, extra: req.query.item });
	}

	if (!req.query.item) {
		return resolve({ msg: { ...itemIndex, ...premiumIndex }, extra: '' });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

//moves
const apiMoves = async (req, res) => {
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
	return getMoveInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getMoveInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (req.query.move && moves[req.query.move]) {
		const result = {};

		result[req.query.move] = moves[req.query.move];

		return resolve({ msg: result, extra: req.query.move });
	}

	if (!req.query.move) {
		return resolve({ msg: moves, extra: '' });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

const apiElements = async (req, res) => {
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
	return getElementInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getElementInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (req.query.element && elements[req.query.element]) {
		const result = {};

		result[req.query.element] = elements[req.query.element];

		return resolve({ msg: result, extra: req.query.element });
	}

	if (!req.query.element) {
		return resolve({ msg: elements, extra: '' });
	}

	return reject({ msg: 'Unknown command', extra: JSON.stringify(req.query) });
});

module.exports = {
	apiCreatures,
	apiItems,
	apiMoves,
	apiElements,

	//for testing
	getCreatureInformationFromJSON,
	getItemInformationFromJSON,
	getMoveInformationFromJSON,
	getElementInformationFromJSON,
};