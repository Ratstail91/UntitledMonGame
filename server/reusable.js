const { log, logActivity } = require('./utilities/logging.js');
const pool = require("./utilities/database.js");

const species = require('./gameplay/species.json');

//reusable
const validateSession = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';
	return pool.promise().query(query, [fields.id, fields.token])
		.then(results => results[0].length > 0 ? fields : reject({ msg: 'Session Timed Out', extra: fields }))
		.then(fields => { logActivity(fields.id); resolve(fields); })
		.catch(e => reject({ msg: 'validateSession error', extra: e }))
	;
});

//NOTE: for display only
const getYourEggs = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT *, TIMEDIFF(incubationTime, NOW()) AS hatchTime FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(eggs => resolve({ eggs: eggs.map(egg => { return { id: egg.id, element: species[egg.species].element, hatchTime: egg.hatchTime }}), ...fields }))
		.catch(e => reject({ msg: 'getYourEggs error', extra: e }))
	;
});

module.exports = {
	validateSession,
	getYourEggs,
};