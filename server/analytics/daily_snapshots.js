const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js");
const { CronJob } = require('cron');

const runDailySnapshots = () => {
	const dailyJob = new CronJob('* * * * * *', () => {
		const query = 'INSERT INTO dailySnapshots \
		(totalAccounts, activeAccounts, totalProfiles, activeProfiles) VALUES (\
		(SELECT COUNT(*) FROM accounts), \
		(SELECT COUNT(*) FROM accounts WHERE NOW() - interval 1 day < lastActivityTime), \
		0, \
		0 \
		);';
		pool.promise().query(query)
			.then(() => log('Daily snapshot taken'))
			.catch(e => log('Daily snapshot failed', e))
		;
	});

	dailyJob.start();
};

module.exports = {
	runDailySnapshots
};
