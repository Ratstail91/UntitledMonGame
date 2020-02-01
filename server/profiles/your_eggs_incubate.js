const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourEggs } = require('../reusable.js');
const { determineSelectedEgg } = require('./your_eggs_sell.js');

const species = require('../gameplay/species.json');

const apiYourEggsIncubate = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(checkCanIncubate)
		.then(determineSelectedEgg)
		.then(incubateSelectedEgg)
		.then(getYourEggs)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkCanIncubate = (fields) => new Promise(async (resolve, reject) => {
	const incubationQuery = 'SELECT COUNT(*) AS total FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND incubationTime IS NOT NULL;';
	const incubationTotal = (await pool.promise().query(incubationQuery, [fields.id]))[0][0].total;

	const incubatorQuery = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = "incubator";';
	const incubatorTotal = (await pool.promise().query(incubatorQuery, [fields.id]))[0][0].total;

	if (incubatorTotal > incubationTotal) {
		return resolve(fields);
	} else {
		return reject({ msg: 'Not Enough Incubators', extra: '' });
	}
});

const incubateSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatureEggs SET incubationTime = NOW() + interval 600 second WHERE id = ?;';
	return pool.promise().query(query, [fields.egg.id])
		.then(results => delete fields.egg)
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'incubateSelectedEgg error', extra: e }))
	;
});

const { CronJob } = require('cron');

const runEggHatchJob = () => {
	const job = new CronJob('* * * * * *', async () => {
		const query = 'SELECT * FROM creatureEggs WHERE incubationTime IS NOT NULL AND incubationTime < NOW();';
		pool.promise().query(query)
			.then(results => results[0])
			.then(eggs => {
				eggs.forEach(async egg => {
					const queryHatch = 'INSERT INTO creatures (profileId, species, geneticPointsHealth, geneticPointsSpeed, geneticPointsStrength, geneticPointsPower) VALUES (?, ?, ?, ?, ?, ?);';
					await pool.promise().query(queryHatch, [egg.profileId, egg.species, egg.geneticPointsHealth, egg.geneticPointsSpeed, egg.geneticPointsStrength, egg.geneticPointsPower]);
					const queryDelete = 'DELETE FROM creatureEggs WHERE id = ?;';
					await pool.promise().query(queryDelete, [egg.id]);
				});
			})
			.catch(e => log('runEggHatchJob error', e))
		;
	});

	job.start();
};

module.exports = {
	apiYourEggsIncubate,
	runEggHatchJob,

	//for testing
	incubateSelectedEgg
};