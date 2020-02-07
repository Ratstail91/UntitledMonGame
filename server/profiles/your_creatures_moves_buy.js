const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, determineSelectedCreature, getCreatureMoves } = require('../reusable.js');

const species = require('../gameplay/species.json');
const moves = require('../gameplay/moves.json');

const apiYourCreaturesMovesBuy = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(determineSelectedCreature)
        .then(checkForSelectedMove)
        .then(checkCoins)
        .then(buySelectedMove)
        .then(subtractCoins)
        .then(getCreatureMoves)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkForSelectedMove = (fields) => new Promise(async (resolve, reject) => {
	if (!species[fields.creature.species].moves.includes(fields.move) || !moves[fields.move]) {
        return reject({ msg: `The creature ${fields.creature.species} can't learn the move ${fields.move}.`, extra: '' });
    }

    const checkQuery = 'SELECT COUNT(*) AS total FROM creatureMovesOwned WHERE creatureId = ? AND idx = ?;';
    return pool.promise().query(checkQuery, [fields.creature.id, fields.move])
        .then(results => results[0][0].total)
        .then(total => total == 0 ? resolve(fields) : reject({ msg: 'This creature already owns this move', extra: '' }))
        .catch(e => reject({ msg: 'checkForSelectedMove error', extra: e }))
    ;
});

//WARNING: duplicate-ish
const checkCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT coins FROM accounts WHERE id = ?;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][0].coins >= moves[fields.move].value ? resolve(fields) : reject({ msg: 'Not enough coins', extra: results[0][0].coins }))
		.catch(e => reject({ msg: 'checkCoins error', extra: e }))
	;
});

const buySelectedMove = (fields) => new Promise((resolve, reject) => {
    const query = 'INSERT INTO creatureMovesOwned (creatureId, idx) VALUES (?, ?);';
    return pool.promise().query(query, [fields.creature.id, fields.move])
        .then(() => resolve(fields))
        .catch(e => reject({ msg: 'buySelectedMove error', extra: e }))
    ;
});

//WARNING: duplicate-ish
const subtractCoins = (fields) => new Promise((resolve, reject) => {
	const query = 'UPDATE accounts SET coins = coins - ? WHERE id = ?;';
	return pool.promise().query(query, [moves[fields.move].value, fields.id])
		.then(results => resolve(fields))
		.catch(e => reject({ msg: 'subtractCoins error', extra: e }))
	;
});

module.exports = {
	apiYourCreaturesMovesBuy,
};