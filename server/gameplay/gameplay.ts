import { log } from '../utilities/logging';

import species from './species.json';
import itemIndex from './item_index.json';
import premiumIndex from './premium_index.json';
import movesIndex from './moves.json';
import elementsIndex from './elements.json';

//utilities
const zipObj = xs => ys => xs.reduce( (obj, x, i) => ({ ...obj, [x]: ys[i] }), {});

//creatures
export const apiCreatures = (req, res) => {
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

export const getCreatureInformationFromJSON = (req) => new Promise((resolve, reject) => {
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
export const apiItems = (req, res) => {
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

export const getItemInformationFromJSON = (req) => new Promise((resolve, reject) => {
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
export const apiMoves = (req, res) => {
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

export const getMoveInformationFromJSON = (req) => new Promise((resolve, reject) => {
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

export const apiElements = (req, res) => {
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

export const getElementInformationFromJSON = (req) => new Promise((resolve, reject) => {
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
