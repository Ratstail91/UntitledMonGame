const { log } = require('./utilities/logging.js');
const pool = require("./utilities/database.js");
const { CronJob } = require('cron');

const itemIndex = require('./gameplay/item_index.json');

const runSoftlockPicker = () => {
	const hourlyJob = new CronJob('0 0 * * * *', async () => {
		//find coins by profileId
		const query = 'SELECT profiles.accountId as accountId, profiles.id AS profileId, coins FROM accounts JOIN profiles ON accounts.id = profiles.accountId;';
		const results = (await pool.promise().query(query))[0];

		//for each profile
		results.forEach(async profile => {
			let totalValue = 0;

			//get the minimum value of cretures and eggs
			totalValue += 200 * (await pool.promise().query('SELECT COUNT(*) AS total FROM creatures WHERE profileId = ?;', [ profile.profileId ]))[0][0].total;
			totalValue += 200 * (await pool.promise().query('SELECT COUNT(*) AS total FROM creatureEggs WHERE profileId = ?;', [ profile.profileId ]))[0][0].total;

			//get the value of items
			const itemsOwned = (await pool.promise().query('SELECT idx FROM items WHERE profileId = ?', [ profile.profileId ]))[0];
			itemsOwned.forEach(async item => totalValue += itemIndex[ item.idx ] ? itemIndex[ item.idx ].value : 0);

			//subtract minQuantities
			totalValue -= itemIndex['incubator'].value;

			//final check
			if (profile.coins + totalValue < 500) {
				const addAmount = 500 - (profile.coins + totalValue);

				await pool.promise().query('UPDATE accounts SET coins = coins + ? WHERE id = ?;', [addAmount, profile.accountId])
					.then(() => log(`softlockPicker added ${addAmount} to ${profile.accountId}`));
			}
		});
	});

	hourlyJob.start();
};

module.exports = {
	runSoftlockPicker,
};