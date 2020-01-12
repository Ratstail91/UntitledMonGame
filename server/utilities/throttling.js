//libraries
const { CronJob } = require('cron');

//globals
let emails = [];

const throttle = (email) => {
	emails[email] = new Date();
}

const isThrottled = (email) => {
	if (emails[email] === undefined) {
		return false;
	}

	if ( Math.abs(emails[email] - new Date()) / 1000 >= 10) { //10 seconds
		delete emails[email]; //remove from the cache
		return false;
	}

	return true;
}

//clear the memory once a day
let job = new CronJob('0 7 * * * *', () => {
	emails = [];
});

job.start();

module.exports = {
	throttle: throttle,
	isThrottled: isThrottled
};