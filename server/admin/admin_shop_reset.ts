//utilities
import { log } from '../utilities/logging';
import pool from '../utilities/database';

import { validateSession } from '../reusable';

export const apiAdminShopReset = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	};

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(refreshShop)
		.then(fields => { return { msg: 'success', extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const refreshShop = (fields) => new Promise(async (resolve, reject) => {
	await require('../shop/shop_eggs.js').shopRefresh();
	await require('../shop/shop_items.js').shopRefresh();
	await require('../shop/shop_premiums.js').shopRefresh();

	return resolve(fields);
});

