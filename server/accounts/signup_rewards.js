const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js");

//signup rewards
const grantSignupRewards = (record) => new Promise(async (resolve, reject) => {
	//TODO: grant referral rewards
	log(`Awarding ${record.referral} for getting ${record.username} to sign up with the code ${record.code}`);

	//grant awards like account types, bonus coins, secret eggs, etc.
	const flagQuery = 'SELECT id, flag FROM rewardCodes WHERE code = ? AND used = FALSE LIMIT 1;';
	const flag = await pool.promise().execute(flagQuery, [record.code]);

	//ignore used or non-existant codes
	if (!flag[0][0]) {
		resolve();
	}

	//process the code flag
	switch(flag[0][0].flag) {
		case 'alpha':
		case 'beta':
			const accountQuery = 'UPDATE accounts SET accountType = ? WHERE username = ?;';
			await pool.promise().execute(accountQuery, [flag[0][0].flag, record.username]);
			break;

		//...
	}

	//mark this code as used
	const codeQuery = 'UPDATE rewardCodes SET used = TRUE WHERE id = ?;';
	await pool.promise().execute(codeQuery, [flag[0][0].id]);

	return resolve();
});

module.exports = {
	grantSignupRewards,
};
