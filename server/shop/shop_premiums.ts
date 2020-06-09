import pool from '../utilities/database';

import { log } from '../utilities/logging';

import premium from '../gameplay/premium_index.json';

export const apiShopPremiums = async (req, res) => {
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
		.then(getShopPremiums)
		.then(premiums => { return { msg: { premiums }, extra: '' };})
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const getShopPremiums = () => new Promise((resolve, reject) => {
	const query = 'SELECT idx FROM shopPremiums ORDER BY shopSlot;';
	return pool.promise().query(query)
		.then(results => results[0])
		.then((rows: any) => rows.map(row => premium[row.idx]))
		.then(premiums => resolve(premiums))
		.catch(e => reject({ msg: 'getShopPremiums error', extra: e }))
	;
});

import { CronJob } from 'cron';

export const runDailyShopPremiumRefresh = () => {
	shopRefresh(); //run on start
	const dailyJob = new CronJob('0 0 0 * * *', shopRefresh);
	dailyJob.start();
};

export const shopRefresh = async () => {
	await pool.promise().query('DELETE FROM shopPremiums;');

	//find all correct creatures based on rarity
	const constant = Object.keys(premium).filter(key => premium[key].shop == 'constant');
	const rotating = Object.keys(premium).filter(key => premium[key].shop == 'rotating');

	const query = 'INSERT INTO shopPremiums (shopSlot, idx) VALUES (?, ?);';
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
