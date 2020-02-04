//environment variables
require('dotenv').config();

//utilities
const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js")

const { validateSession } = require('../reusable.js');

const apiDeleteAccount = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
//		res.status(200).json(obj);
		res.end();
	};

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(markAccountForDeletion)
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const markAccountForDeletion = (fields) => new Promise(async (resolve, reject) => {
	const query = 'UPDATE accounts SET deletionTime = now() + interval 2 day WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(() => resolve({ msg: 'Account marked for deletion', extra: [fields.id] }))
		.catch(e => reject({ msg: 'markAccountForDeletion error', extra: e }))
	;
});

//delete the accounts marked for deletion
const { CronJob } = require('cron');

const job = new CronJob('0 * * * * *', async () => {
	const query = 'DELETE FROM accounts WHERE deletionTime < now();';
	pool.promise().query(query)
		.then(results => {
			if (results[0].affectedRows > 0) {
				log('Accounts deleted');
			}
		})
		.catch(e => log('Account deletion error: ', e));
});

job.start(); //TODO: move this to a run function

module.exports = {
	apiDeleteAccount,
	markAccountForDeletion,
};
