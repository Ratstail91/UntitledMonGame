//environment variables
require('dotenv').config();

//utilities
const { log } = require('../utilities/logging.js');

const { validateSession } = require('../accounts/sessions.js');

const accountDeleteRequest = (connection) => (req, res) => {
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

	return new Promise((resolve, reject) => resolve({ fields: req.body }))
		.then(validateSession(connection))
		.then(markAccountForDeletion(connection))
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const markAccountForDeletion = (connection) => (fields) => new Promise(async (resolve, reject) => {
	const query = 'UPDATE accounts SET deletionTime = now() + interval 2 day WHERE id = ?;';
	return connection.query(query, [fields.id])
		.then(() => resolve({ msg: 'Account marked for deletion', extra: [fields.id] }))
		.catch(e => reject({ msg: 'markAccountForDeletion error', extra: e }))
	;
});

//delete the accounts marked for deletion
const { CronJob } = require('cron');
const { connection } = require('../utilities/database.js');

let job = new CronJob('0 * * * * *', () => {
	const query = 'DELETE FROM accounts WHERE deletionTime < now();';
	connection.query(query)
		.then(results => {
			if (results.affectedRows > 0) {
				log('Accounts deleted');
			}
		})
		.catch(e => log('Account deletion error: ', e));
});

job.start();

module.exports = {
	accountDeleteRequest,
	markAccountForDeletion,
};
