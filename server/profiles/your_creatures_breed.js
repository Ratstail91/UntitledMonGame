const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, determineSelectedCreature, getYourCreatures } = require('../reusable.js');

const speciesIndex = require('../gameplay/species.json');

const apiYourCreaturesBreed = async (req, res) => {
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
		.then(checkBreedingTotal)
		.then(determineSelectedCreature)
		.then(markAsBreeding)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkBreedingTotal = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND breeding = TRUE;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].total)
		.then(total => total < 2 ? resolve(fields) : reject({ msg: 'You can breed two creatures at a time', extra: total }))
		.catch(e => reject({ msg: 'checkBreedingTotal error', extra: e }))
	;
});

const markAsBreeding = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET breeding = TRUE WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'markAsBreeding error', extra: e }))
	;
});

const { CronJob } = require('cron');

const runBreedingJob = () => {
	const job = new CronJob('0 0 */12 * * *', async () => {
		const query = '\
			SELECT * FROM\
				(SELECT id AS idA, species AS speciesA, profileId AS profileIdA, geneticPointsHealth AS healthA, geneticPointsSpeed AS speedA, geneticPointsStrength AS strengthA, geneticPointsPower AS powerA FROM creatures WHERE breeding = TRUE ORDER BY id ASC) AS a\
			JOIN\
				(SELECT id AS idB, species AS speciesB, profileId AS profileIdB, geneticPointsHealth AS healthB, geneticPointsSpeed AS speedB, geneticPointsStrength AS strengthB, geneticPointsPower AS powerB FROM creatures WHERE breeding = TRUE ORDER BY id DESC) AS b\
			ON\
				a.profileIdA = b.profileIdB\
			WHERE\
				a.idA <> b.idB\
			;\
		';
		const done = [];

		await pool.promise().query(query)
			.then(results => results[0])
			.then(pairs => pairs.forEach(pair => {
				if (!done[pair.idA] && !done[pair.idB]) {
					done[pair.idA] = true;
					done[pair.idB] = true;
					breedPair(pair);
				}
			}))
			.catch(e => log('runBreedingJob error', e))
		;
	});

	job.start();
};

const breedPair = (pair) => new Promise((resolve, reject) => {
	//for use below
	const rarities = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
	const rarity = Math.min(rarities[speciesIndex[pair.speciesA].egg.rarity], rarities[speciesIndex[pair.speciesB].egg.rarity]);

	//determine profileId
	let profileId = pair.profileIdA;

	//TODO: test this when more creatures are implemented

	//determine species
	let species;
	if (pair.speciesA == pair.speciesB) {
		species = pair.speciesA;
	} else if (speciesIndex[pair.speciesA].element == speciesIndex[pair.speciesB].element) {
		//randomized within this element and equal or below this rarity
		const filteredKeys = Object.keys(speciesIndex).filter(key => speciesIndex[key].element == speciesIndex[pair.speciesA].element && rarities[speciesIndex[key].egg.rarity] <= rarity);
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	} else {
		//randomize equal or below this rarity
		const filteredKeys = Object.keys(speciesIndex).filter(key => rarities[speciesIndex[key].egg.rarity] <= rarity);
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	}

	if (Math.floor(Math.random() * 20) == 0) {
		//finally, small chance of mutation equal or below rarity
		const filteredKeys = Object.keys(speciesIndex).filter(key => rarities[speciesIndex[key].egg.rarity] <= rarity);
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	}

	//genetics
	let geneticsMix = {
		'geneticPointsHealth': [pair.healthA, pair.healthB],
		'geneticPointsSpeed': [pair.speedA, pair.speedB],
		'geneticPointsStrength': [pair.strengthA, pair.strengthB],
		'geneticPointsPower': [pair.powerA, pair.powerB],
	};
	let geneticsResults = {
		//
	};

	const randomKey = () => Object.keys(geneticsMix)[Math.floor(Math.random() * Object.keys(geneticsMix).length)];

	let rand;

	rand = randomKey();
	geneticsResults[rand] = geneticsMix[rand][0]; //mother
	delete geneticsMix[rand];

	rand = randomKey();
	geneticsResults[rand] = geneticsMix[rand][1]; //father
	delete geneticsMix[rand];

	rand = randomKey();
	geneticsResults[rand] = geneticsMix[rand][Math.floor(Math.random() * 2)]; //random parent
	delete geneticsMix[rand];

	geneticsResults[randomKey()] = Math.floor(Math.random() * 16); //mutation

	//finally, make egg
	const query = 'INSERT INTO creatureEggs (profileId, species, geneticPointsHealth, geneticPointsSpeed, geneticPointsStrength, geneticPointsPower) VALUES (?, ?, ?, ?, ?, ?);';
	return pool.promise().query(query, [profileId, species, geneticsResults.geneticPointsHealth, geneticsResults.geneticPointsSpeed, geneticsResults.geneticPointsStrength, geneticsResults.geneticPointsPower])
		.catch(e => log('breedPair error', e));
});

module.exports = {
	apiYourCreaturesBreed,

	//for testing
	checkBreedingTotal,
	markAsBreeding,

	runBreedingJob,
};
//TODO: special rarity can't breed