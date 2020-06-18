import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { determineSelectedCreature, getYourCreatures } from '../reusable';

import speciesIndex from '../gameplay/species.json';

export const apiYourCreaturesBreed = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(checkBreedingTotal)
		.then(determineSelectedCreature)
		.then(checkNotBattling)
		.then(checkNotTraining)
		.then(markAsBreeding)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const checkBreedingTotal = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND breeding = TRUE;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].total)
		.then(total => total < 2 ? resolve(fields) : reject({ msg: 'You can breed two creatures at a time', extra: total }))
		.catch(e => reject({ msg: 'checkBreedingTotal error', extra: e }))
	;
});

export const checkNotBattling = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM battleBoxSlots WHERE creatureId = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(results => results[0][0].total)
		.then(total => total == 0 ? resolve(fields) : reject({ msg: 'Can\'t breed with a battling creature', extra: '' }))
		.catch(e => reject({ msg: 'checkNotBattling error', extra: e }))
	;
});

export const checkNotTraining = (fields) => new Promise((resolve, reject) => {
	return !fields.creature.trainingTime ? resolve(fields) : reject({ msg: 'Can\'t breed with a training creature', extra: '' });
});

export const markAsBreeding = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE creatures SET breeding = TRUE WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'markAsBreeding error', extra: e }))
	;
});

import { CronJob } from 'cron';

export const runBreedingJob = () => {
	const twiceADayJob: CronJob = new CronJob('* * */12 * * *', async () => {
		const query: string = 'SELECT * FROM creatures WHERE breeding = TRUE ORDER BY profileId;';
		const breedingCreatures: any = (await pool.promise().query(query))[0];

		for (let i = 0; i < breedingCreatures.length; /* DO NOTHING */) {
			//this profile
			const profileId: number = breedingCreatures[i].profileId;

			if (breedingCreatures[i + 1] && breedingCreatures[i + 1].profileId == profileId) {
				await breedPair(breedingCreatures[i], breedingCreatures[i + 1]);
			}

			//increment 'i'
			while (breedingCreatures[i] && breedingCreatures[i].profileId == profileId) {
				i++;
			}
		}
	});

	twiceADayJob.start();
};


export const breedPair = (mother, father) => {
	//determine new egg's rarity
	const rarities = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
	const rarity = Math.min(rarities[speciesIndex[mother.species].egg.rarity], rarities[speciesIndex[father.species].egg.rarity]);

	//TODO: test this when more creatures are implemented

	//determine the species
	let species;
	if (mother.species == father.species) {
		species = mother.species;
	}

	else if (speciesIndex[mother.species].element == speciesIndex[father.species].element) {
		//randomized within this element and equal or below this rarity
		const filteredKeys = Object.keys(speciesIndex).filter(key => speciesIndex[key].element == speciesIndex[mother.species].element && rarities[speciesIndex[key].egg.rarity] <= rarity);
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	}

	else {
		//randomize equal or below this rarity
		const filteredKeys = Object.keys(speciesIndex).filter(key => rarities[speciesIndex[key].egg.rarity] <= rarity);
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	}

	if (Math.floor(Math.random() * 20) == 0) {
		//finally, small chance of mutation to a creature one rarity above
		const filteredKeys = Object.keys(speciesIndex).filter(key => rarities[speciesIndex[key].egg.rarity] = Math.min(rarity + 1, rarities['common'])); //TODO: update "common" to "uncommon" when uncommons are added
		species = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
	}

	//genetics
	let geneticsMix: object = {
		'geneticPointsHealth': [mother.geneticPointsHealth, father.geneticPointsHealth],
		'geneticPointsSpeed': [mother.geneticPointsSpeed, father.geneticPointsSpeed],
		'geneticPointsStrength': [mother.geneticPointsStrength, father.geneticPointsStrength],
		'geneticPointsPower': [mother.geneticPointsPower, father.geneticPointsPower],
	};
	let geneticsResults: any = {
		//EMPTY
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

	geneticsResults[randomKey()] = Math.floor(Math.random() * 17); //mutation

	//finally, make egg
	const query = 'INSERT INTO creatureEggs (profileId, species, geneticPointsHealth, geneticPointsSpeed, geneticPointsStrength, geneticPointsPower) VALUES (?, ?, ?, ?, ?, ?);';
	return pool.promise().query(query, [mother.profileId, species, geneticsResults.geneticPointsHealth, geneticsResults.geneticPointsSpeed, geneticsResults.geneticPointsStrength, geneticsResults.geneticPointsPower])
		.catch(e => log('breedPair error', e));
};
