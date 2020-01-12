const { log } = require('../utilities/logging.js');

const verifyRequest = (connection) => (req, res) => {
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
	return getInformationFromDatabase(connection, req)
		.then(verifyToken(req))
		.then(createAccount(connection))
		.then(() => handleSuccess({msg: log('<p>Verification succeeded!</p><p><a href="/">Return Home</a></p>'), extra: [req.query.email]})) //TODO: prettier success page
		.catch(handleRejection)
	;
}

const getInformationFromDatabase = (connection, req) => new Promise( async (resolve, reject) => {
	//get the saved data
	let signupsQuery = 'SELECT * FROM signups WHERE email = ?;';
	return connection.query(signupsQuery, [req.query.email])
		.then((results) => {
			if (results.length === 1) {
				resolve(results[0]);
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

const createAccount = (connection) => (record) => new Promise( async (resolve, reject) => {
	//BUGFIX: a delay to prevent the fail message appearing to the end user
	setTimeout(async () => {
		log('Trying to create account', record.email);

		//move the data from signups to accounts
		let moveQuery = 'INSERT IGNORE INTO accounts (email, username, hash, promotions) VALUES (?, ?, ?, ?);';
		await connection.query(moveQuery, [record.email, record.username, record.hash, record.promotions]);

		//delete from signups
		let deleteQuery = 'DELETE FROM signups WHERE email = ?;';
		await connection.query(deleteQuery, [record.email]);

		log('Account created', record.email);
	}, 3000); //3 second delay on account creation

	//skip out and leave setTimeout to do it's thing
	resolve();
});

module.exports = {
	//public API
	verifyRequest: verifyRequest,

	//for testing
	getInformationFromDatabase: getInformationFromDatabase,
	verifyToken: verifyToken,
	createAccount: createAccount
};

