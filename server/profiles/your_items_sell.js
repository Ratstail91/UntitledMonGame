const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');
const { getYourProfile } = require('./your_profile.js');
const { getYourItems } = require('./your_items.js');

const itemIndex = require('../gameplay/item_index.json');

const apiYourItemsSell = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, /* obj.extra.toString() */));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(determineSelectedItem)
		.then(checkMinQuantity)
		.then(addCoins)
		.then(sellItem)
		.then(getYourItems)
		.then(getYourProfile)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const determineSelectedItem = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(item => item ? resolve({ item, ...fields }) : reject({ msg: 'item not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedItem error', extra: e }))
	;
});

const checkMinQuantity = (fields) => new Promise((resolve, reject) => {
	if (!itemIndex[fields.item.idx].minQuantity) {
		return resolve(fields);
	}

	const query = 'SELECT COUNT(*) AS total FROM items WHERE idx = ? AND profileId IN (SELECT id FROM profiles WHERE accountId = ?);';
	return pool.promise().query(query, [fields.item.idx, fields.id])
		.then(result => result[0][0].total > itemIndex[fields.item.idx].minQuantity ? resolve(fields) : reject({ msg: 'You can\'t sell this! (you need at least some)', extra: fields }))
		.catch(e => reject({ msg: 'checkMinQuantity error', extra: e }))
	;
});

const addCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins + ? WHERE id = ?;';
	return pool.promise().query(query, [itemIndex[fields.item.idx].value / 2, fields.id]) //TODO: change value to price, for eggs too
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'addCoins error', extra: e }))
	;
});

const sellItem = (fields) => new Promise((resolve, reject) => {
	const query = 'DELETE FROM items WHERE id = ?;';
	return pool.promise().query(query, [fields.item.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'sellItem error', extra: e }))
	;
});

module.exports = {
	apiYourItemsSell,

	//for testing
	determineSelectedItem,
	addCoins,
	sellItem,
};