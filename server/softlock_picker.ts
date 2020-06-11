import { log, logActivity } from './utilities/logging';
import pool from './utilities/database';
import { CronJob } from 'cron';

import itemIndex from './gameplay/item_index.json';

export const runSoftlockPicker = () => {
	const hourlyJob = new CronJob('0 0 * * * *', async () => {
		//find coins by profileId
		const query = 'SELECT profiles.accountId as accountId, profiles.id AS profileId, coins FROM accounts JOIN profiles ON accounts.id = profiles.accountId;';
		const results: any  = (await pool.promise().query(query))[0];

		//for each profile
		results.forEach(async profile => {
			//if you have at least two creatures/eggs, you can breed them
			let creatureCount = (await pool.promise().query('SELECT COUNT(*) AS total FROM creatures WHERE profileId = ?;', profile.profileId))[0][0].total;
			creatureCount += (await pool.promise().query('SELECT COUNT(*) AS total FROM creatureEggs WHERE profileId = ?;', profile.profileId))[0][0].total;

			if (creatureCount >= 2) {
				return;
			}

			//value
			let totalValue = 0;

			//get the minimum value of the eggs
			totalValue += 100 * (await pool.promise().query('SELECT COUNT(*) AS total FROM creatureEggs WHERE profileId = ?;', [ profile.profileId ]))[0][0].total;

			//get the value of items
			const itemsOwned: any  = (await pool.promise().query('SELECT idx FROM items WHERE profileId = ?', [ profile.profileId ]))[0];
			itemsOwned.forEach(item => totalValue += itemIndex[ item.idx ] ? itemIndex[ item.idx ].value : 0);

			//subtract minQuantities
			totalValue -= itemIndex['incubator'].value;
			//NOTE: battleboxes should be here, but they're premiums

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
