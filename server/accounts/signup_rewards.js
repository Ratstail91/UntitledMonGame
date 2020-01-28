const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js");

//signup rewards
const grantSignupRewards = (signupRecord) => new Promise(async (resolve, reject) => {
	//TODO: grant referral rewards
	log(`Awarding ${signupRecord.referral} for getting ${signupRecord.username} to sign up with the code ${signupRecord.code}`);

	//grant awards like account types, bonus coins, secret eggs, etc.
	const flagQuery = 'SELECT id, flag FROM rewardCodes WHERE code = ? AND used = FALSE LIMIT 1;';
	const flag = await pool.promise().execute(flagQuery, [signupRecord.code]);

	//ignore used or non-existant codes
	if (flag[0].length == 0) {
		return resolve();
	}

	//process the code flag
	switch(flag[0][0].flag) {
		case 'alpha':
		case 'beta':
			const accountQuery = 'UPDATE accounts SET accountType = ? WHERE username = ?;';
			await pool.promise().execute(accountQuery, [flag[0][0].flag, signupRecord.username]);
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
