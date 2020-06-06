const { log } = require('../utilities/logging.js');

const species = require('./species.json');
const itemIndex = require('./item_index.json');
const premiumIndex = require('./premium_index.json');
const movesIndex = require('./moves.json');
const elementsIndex = require('./elements.json');

//utilities
const zipObj = xs => ys => xs.reduce( (obj, x, i) => ({ ...obj, [x]: ys[i] }), {});

//creatures
const apiCreatures = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		//log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
	}

	//pass the process along
	return getCreatureInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getCreatureInformationFromJSON = (req) => new Promise((resolve, reject) => {
	//these don't return the idx, they assume you already have the idx
	if (!req.query.creature) {
		return resolve({ msg: species, extra: '' });
	}

	const keys = req.query.creature.split(',');

	const values = keys.map(idx => {
		if (!species[idx]) {
			return null;
		}

		return species[idx];
	});

	const result = zipObj(keys)(values);

	return resolve({ msg: result, extra: '' });
});

//items
const apiItems = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		//log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
	}

	//pass the process along
	return getItemInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getItemInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (!req.query.item) {
		return resolve({ msg: { ...itemIndex, ...premiumIndex }, extra: '' });
	}

	const keys = req.query.item.split(',');

	const values = keys.map(idx => {
		if (!itemIndex[idx] && !premiumIndex[idx]) {
			return null;
		}

		if (itemIndex[idx]) {
			return itemIndex[idx];
		} else {
			return premiumIndex[idx];
		}
	});

	const result = zipObj(keys)(values);

	return resolve({ msg: result, extra: '' });
});

//moves
const apiMoves = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		//log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
	}

	//pass the process along
	return getMoveInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getMoveInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (!req.query.move) {
		return resolve({ msg: movesIndex, extra: '' });
	}

	const keys = req.query.move.split(',');

	const values = keys.map(idx => {
		if (!movesIndex[idx]) {
			return null;
		}

		return movesIndex[idx];
	});

	const result = zipObj(keys)(values);

	return resolve({ msg: result, extra: '' });
});

const apiElements = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
		//log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
	}

	//pass the process along
	return getElementInformationFromJSON(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getElementInformationFromJSON = (req) => new Promise((resolve, reject) => {
	if (!req.query.element) {
		return resolve({ msg: elementsIndex, extra: '' });
	}

	const keys = req.query.element.split(',');

	const values = keys.map(idx => {
		if (!elementsIndex[idx]) {
			return null;
		}

		return elementsIndex[idx];
	})

	const result = zipObj(keys)(values);

	return resolve({ msg: result, extra: '' });
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