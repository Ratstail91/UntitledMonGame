const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js");

//signup rewards
const grantSignupRewards = (record) => new Promise(async(resolve, reject) => {
	log(`Awarding ${record.referral} for getting ${record.username} to sign up with the code ${record.code}`);

	//TODO: grant awards like account types, bonus coins, secret eggs, etc.

	return resolve();
});

module.exports = {
	grantSignupRewards,
};