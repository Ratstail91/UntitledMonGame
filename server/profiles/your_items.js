const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const itemIndex = require('../gameplay/item_index.json');

const apiYourItems = async (req, res) => {
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
		.then(getYourItems)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const getYourItems = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id, idx FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(items => resolve({ items: items.map(item => { return { id: item.id, ...itemIndex[item.idx] }}), ...fields })) //TODO: (1) itemIndex or premiumIndex
		.catch(e => reject({ msg: 'getYourItems error', extra: e }))
	;
});

module.exports = {
	apiYourItems,

	//for testing
	getYourItems,
};