const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, determineSelectedCreature, getCreatureMoves } = require('../reusable.js');

const species = require('../gameplay/species.json');
const moves = require('../gameplay/moves.json');

const apiYourCreaturesMovesEquip = async (req, res) => {
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
		.then(checkMaxMovesEquipped)
        .then(checkForSelectedMoveOwned)
        .then(equipSelectedMove)
        .then(getCreatureMoves)
		.then(fields => { return { msg: fields, extra: '' }; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const checkMaxMovesEquipped = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT COUNT(*) AS total FROM creatureMovesOwned WHERE creatureId = ? AND equipped = TRUE;';
	return pool.promise().query(query, [fields.creature.id])
		.then(results => results[0][0].total)
		.then(total => total < 4 ? resolve(fields) : reject({ msg: 'You can\'t equip more than 4 moves on a single creature', extra: total }))
		.catch(e => reject({ msg: 'checkMaxMovesEquipped error', extra: e }))
	;
});

//WARNING: duplication-ish
const checkForSelectedMoveOwned = (fields) => new Promise(async (resolve, reject) => {
	if (!species[fields.creature.species].moves.includes(fields.move)) {
        return reject({ msg: `The creature ${fields.creature.species} can't learn the move ${fields.move}.`, extra: '' });
    }

    const checkQuery = 'SELECT COUNT(*) AS total FROM creatureMovesOwned WHERE creatureId = ? AND idx = ?;';
    return pool.promise().query(checkQuery, [fields.creature.id, fields.move])
        .then(results => results[0][0].total)
        .then(total => total > 0 ? resolve(fields) : reject({ msg: 'This creature doesn\'t know that move', extra: '' }))
        .catch(e => reject({ msg: 'checkForSelectedMoveOwned error', extra: e }))
    ;
});

const equipSelectedMove = (fields) => new Promise((resolve, reject) => {
    const query = 'UPDATE creatureMovesOwned SET equipped = TRUE WHERE creatureId = ? AND idx = ?;';
    return pool.promise().query(query, [fields.creature.id, fields.move])
        .then(() => resolve(fields))
        .catch(e => reject({ msg: 'buySelectedMove error', extra: e }))
    ;
});

module.exports = {
	apiYourCreaturesMovesEquip,

	//for testing
	checkForSelectedMoveOwned,
	equipSelectedMove,
};