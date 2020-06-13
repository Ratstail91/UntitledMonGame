import pool from '../utilities/database';

import { log } from '../utilities/logging';

import { getYourCreatures, determineSelectedCreature } from '../reusable';

export const apiYourCreaturesTrain = (req, res) => {
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
		.then(checkForOtherTraining)
		.then(determineSelectedCreature)
		.then(checkForBreeding)
		.then(checkStatTotal)
		.then(trainSelectedCreature)
		.then(getYourCreatures)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

export const checkForOtherTraining = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND trainingTime IS NOT NULL;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].total)
		.then(total => total == 0 ? resolve(fields) : reject({ msg: 'Can\'t train more than one creature at a time', extra: '' }))
		.catch(e => reject({ msg: 'checkForOtherTraining error', extra: e }))
	;
});

export const checkForBreeding = (fields) => new Promise((resolve, reject) => {
	return !fields.creature.breeding ? resolve(fields) : reject({ msg: 'Can\'t train with a breeding creature', extra: '' });
});

export const checkStatTotal = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT statPointsHealth + statPointsSpeed + statPointsStrength + statPointsPower AS statTotal FROM creatures WHERE id = ?;';
	return pool.promise().query(query, [fields.creature.id])
		.then(results => results[0][0].statTotal)
		.then(statTotal => statTotal < 16 ? resolve({ statTotal, ...fields}) : reject({ msg: 'Can\'t train this creature any more!', extra: '' }))
		.catch(e => reject({ msg: 'checkStatTotal error', extra: e }))
});

export const trainSelectedCreature = (fields) => new Promise((resolve, reject) => {
	//extra check
	if (fields.extra != 'health' && fields.extra != 'speed' && fields.extra != 'strength' && fields.extra != 'power') {
		return reject({ msg: 'Invalid trainingType', extra: fields.extra });
	}

	const query = 'UPDATE creatures SET trainingTime = NOW() + INTERVAL ? MINUTE, trainingType = ? WHERE id = ?;';
	return pool.promise().query(query, [fields.statTotal + 1, fields.extra, fields.creature.id])
		.then(() => resolve(fields))
		.catch(e => reject({ msg: 'trainSelectedCreature error', extra: e }))
	;
});

import { CronJob } from 'cron';

export const runTrainJob = () => {
	const job = new CronJob('* * * * * *', () => {
		const query = 'SELECT * FROM creatures WHERE trainingTime IS NOT NULL AND trainingTime < NOW();';
		pool.promise().query(query)
			.then(results => results[0])
			.then((creatures:any) => {
				creatures.forEach(async creature => {
					let query;

					switch(creature.trainingType) {
						case 'health':
							query = 'UPDATE creatures SET trainingTime = NULL, statPointsHealth = statPointsHealth + 1 WHERE id = ?;';
							break;

						case 'speed':
							query = 'UPDATE creatures SET trainingTime = NULL, statPointsSpeed = statPointsSpeed + 1 WHERE id = ?;';
							break;

						case 'strength':
							query = 'UPDATE creatures SET trainingTime = NULL, statPointsStrength = statPointsStrength + 1 WHERE id = ?;';
							break;

						case 'power':
							query = 'UPDATE creatures SET trainingTime = NULL, statPointsPower = statPointsPower + 1 WHERE id = ?;';
							break;

						default:
							throw "Unknown trainingType";
					}

					await pool.promise().query(query, [creature.id]);
				});
			})
			.catch(e => log('runTrainJob error', e))
		;
	});

	job.start();
};
