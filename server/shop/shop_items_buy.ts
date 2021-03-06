import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { getYourProfile } from '../profiles/your_profile';

import itemIndex from '../gameplay/item_index.json';

export const apiShopItemsBuy = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(determineSelectedItem)
		.then(checkMaxQuantity)
		.then(checkCoins)
		.then(subtractCoins)
		.then(fetchProfileId)
		.then(buySelectedItem)
		.then(getYourProfile)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const determineSelectedItem = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM shopItems WHERE shopSlot = ?;';
	return pool.promise().query(query, [fields.index])
		.then((results: any) => results[0].length == 1 ? resolve({ ...fields, item: results[0][0] }) : reject({ msg: 'determineSelectedItem error', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedItem error', extra: e }))
	;
});

export const checkMaxQuantity = (fields) => new Promise((resolve, reject) => {
	if (!itemIndex[fields.item.idx].maxQuantity) {
		return resolve(fields);
	}

	const query = 'SELECT COUNT(*) AS total FROM items WHERE idx = ? AND profileId IN (SELECT id FROM profiles WHERE accountId = ?);';
	return pool.promise().query(query, [fields.item.idx, fields.id])
		.then(result => result[0][0].total < itemIndex[fields.item.idx].maxQuantity ? resolve(fields) : reject({ msg: 'You can\'t buy this! (You own too many)', extra: fields }))
		.catch(e => reject({ msg: 'checkMaxQuantity error', extra: e }))
	;
});

export const checkCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT coins FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].coins >= itemIndex[fields.item.idx].value ? resolve(fields) : reject({ msg: 'Not enough coins', extra: results[0][0].coins }))
		.catch(e => reject({ msg: 'checkCoins error', extra: e }))
	;
});

export const subtractCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins - ? WHERE id = ?;';
	return pool.promise().query(query, [itemIndex[fields.item.idx].value, fields.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'subtractCoins error', extra: e }))
	;
});

export const fetchProfileId = (fields) => new Promise((resolve, reject) => { //WARNING: duplicate
	const query = 'SELECT id FROM profiles WHERE accountId = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].id)
		.then(profileId => resolve({ ...fields, profileId }))
		.catch(e => reject({ msg: 'fetchProfileId error', extra: e }))
	;
});

export const buySelectedItem = (fields) => new Promise((resolve, reject) => {
	const query = 'INSERT INTO items (profileId, idx) VALUES (?, ?);';
	return pool.promise().query(query, [fields.profileId, fields.item.idx])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'buySelectedItem error', extra: e }))
	;
});
