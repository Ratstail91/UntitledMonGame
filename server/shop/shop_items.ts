import pool from '../utilities/database';

import { log } from '../utilities/logging';

import itemIndex from '../gameplay/item_index.json';

export const apiShopItems = (req, res) => {
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
		.then(getShopItems)
		.then(items => { return { msg: { items }, extra: '' };})
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const getShopItems = () => new Promise((resolve, reject) => {
	const query = 'SELECT idx FROM shopItems ORDER BY shopSlot;';
	return pool.promise().query(query)
		.then(results => results[0])
		.then((rows: any) => rows.map(row => itemIndex[row.idx]))
		.then(items => resolve(items))
		.catch(e => reject({ msg: 'getShopItems error', extra: e }))
	;
});

import { CronJob } from 'cron';

export const runWeeklyShopItemRefresh = () => {
	shopRefresh(); //run on start
	const weeklyJob = new CronJob('0 0 0 * * 0', shopRefresh);
	weeklyJob.start();
};

export const shopRefresh = async () => {
	await pool.promise().query('DELETE FROM shopItems;');

	//find all correct creatures based on rarity
	const constant = Object.keys(itemIndex).filter(key => itemIndex[key].shop == 'constant');
	const rotating = Object.keys(itemIndex).filter(key => itemIndex[key].shop == 'rotating');

	const query = 'INSERT INTO shopItems (shopSlot, idx) VALUES (?, ?);';
	let shopSlot = 0;

	//reusable snippet
	const insertFromArray = async (arr, num) => {
		num = Math.min(arr.length, num);
		for (let i = 0; i < num; i++) {
			const rand = Math.floor(Math.random() * arr.length);
			await pool.promise().query(query, [shopSlot++, arr[rand]]);
			arr.splice(rand, 1);
		}
	};

	insertFromArray(rotating, 3);

	for (let i = 0; i < constant.length; i++) {
		await pool.promise().query(query, [shopSlot++, constant[i]]);
	}
};
