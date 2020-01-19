const { log } = require('../utilities/logging.js');
const pool = require("../utilities/database.js")

const apiVerify = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).write(obj.msg); //echo the ugly confirmation page
		res.end();
	}

	//pass the process along
	return getInformationFromDatabase(req)
		.then(verifyToken(req))
		.then(createAccount)
		.then(() => handleSuccess({msg: log('<p>Verification succeeded!</p><p><a href="/">Return Home</a></p>'), extra: [req.query.email]})) //TODO: prettier success page
		.catch(handleRejection)
	;
}

const getInformationFromDatabase = (req) => new Promise( async (resolve, reject) => {
	//get the saved data
	let signupsQuery = 'SELECT * FROM signups WHERE email = ?;';
	return pool.promise().query(signupsQuery, [req.query.email])
		.then((results) => {
			if (results[0].length === 1) {
				resolve(results[0][0]);
			} else {
				reject({msg: 'That account does not exist or this link has already been used.', extra: [req.query.email, req.query.verify]})
			}
		})
	;
});

const verifyToken = (req) => (record) => new Promise( async (resolve, reject) => {
	if (req.query.verify != record.verify) {
		reject({msg: 'Verification failed!', extra: [req.query.email, req.query.verify, record.verify]});
	} else {
		resolve(record);
	}
});

const createAccount = (record) => new Promise( async (resolve, reject) => {
	//BUGFIX: a delay to prevent the fail message appearing to the end user
	setTimeout(async () => {
		log('Trying to create account', record.email);

		//move the data from signups to accounts
		let moveQuery = 'INSERT IGNORE INTO accounts (email, username, hash, promotions) VALUES (?, ?, ?, ?);';
		await pool.promise().query(moveQuery, [record.email, record.username, record.hash, record.promotions]);

		//delete from signups
		let deleteQuery = 'DELETE FROM signups WHERE email = ?;';
		await pool.promise().query(deleteQuery, [record.email]);

		log('Account created', record.email);
	}, 3000); //3 second delay on account creation

	//skip out and leave setTimeout to do it's thing
	resolve();
});

module.exports = {
	//public API
	apiVerify,

	//for testing
	getInformationFromDatabase,
	verifyToken,
	createAccount,
};

