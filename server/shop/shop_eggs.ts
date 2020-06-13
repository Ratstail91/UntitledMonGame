import pool from '../utilities/database';

import { log } from '../utilities/logging';

import species from '../gameplay/species.json';

export const apiShopEggs = (req, res) => {
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
		.then(getShopEggs)
		.then(eggs => { return { msg: { eggs }, extra: '' };})
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const getShopEggs = () => new Promise((resolve, reject) => {
	const query = 'SELECT species FROM shopEggs ORDER BY shopSlot;';
	return pool.promise().query(query)
		.then(results => results[0])
		.then((eggs: any) => eggs.map(egg => { return { element: species[egg.species].element, rarity: species[egg.species].egg.rarity, value: species[egg.species].egg.value }; }))
		.then(eggs => resolve(eggs))
		.catch(e => reject({ msg: 'getShopEggs error', extra: e }))
	;
});

import { CronJob } from 'cron';

export const runDailyShopEggRefresh = () => {
	shopRefresh();
	const dailyJob = new CronJob('0 0 0 * * *', shopRefresh);
	dailyJob.start();
};

export const shopRefresh = async () => {
	await pool.promise().query('DELETE FROM shopEggs;');

	//find all correct creatures based on rarity
	const common = Object.keys(species).filter(key => species[key].egg.rarity == 'common');
	const uncommon = Object.keys(species).filter(key => species[key].egg.rarity == 'uncommon');
	const rare = Object.keys(species).filter(key => species[key].egg.rarity == 'rare');
	const mythic = Object.keys(species).filter(key => species[key].egg.rarity == 'mythic');

	const query = 'INSERT INTO shopEggs (shopSlot, species) VALUES (?, ?);';
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

	//no specials generated by the shop

	if (Math.floor(Math.random() * 10) == 0) {
		insertFromArray(mythic, 1);
	}

	insertFromArray(rare, 1);
	insertFromArray(uncommon, 2);
	insertFromArray(common, 3);
};