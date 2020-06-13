import pool from '../utilities/database';

import { log } from '../utilities/logging';

import braintree from 'braintree';

import premiumIndex from '../gameplay/premium_index.json';

let gateway = null;

export const connectBraintree = () => {
	gateway = braintree.connect({
		accessToken: process.env.PAYPAL_ACCESS
	});
};

export const apiGenerateClientToken = (req, res) => new Promise((resolve, reject) => {
	gateway.clientToken.generate({}, (err, response) => {
		res.status(200).json({ clientToken: response.clientToken });
		res.end();
	});
});

export const apiCheckout = (req, res) => new Promise(async (resolve, reject) => {
	const premiumRecord = (await pool.promise().query('SELECT * FROM shopPremiums WHERE shopSlot = ?;', [req.body.index]))[0][0];

	if (!premiumRecord) {
		res.status(400).write('No premium item with that shop index was found');
		res.end();
		return;
	}

	const saleRequest = {
		amount: premiumIndex[premiumRecord.idx].value / 100,
		paymentMethodNonce: req.body.nonce,
		descriptor: {
			name: "KGS*Egg Trainer"
		},
	};

	gateway.transaction.sale(saleRequest, async (err, result) => {
		if (err || !result.success) {
			res.status(400).write(`${err}`);
		} else {
			await pool.promise().query('INSERT INTO premiumTransactions (accountId, idx, state) VALUES (?, ?, "complete");', [req.body.id, premiumRecord.idx]);
			await pool.promise().query('INSERT INTO items (profileId, idx) VALUES((SELECT id FROM profiles WHERE accountId = ?), ?);', [req.body.id, premiumRecord.idx])

			res.status(200).json({ msg: `Success! you have purchased a ${premiumIndex[premiumRecord.idx].name}` });
		}

		res.end();
	});

	return resolve();
});
