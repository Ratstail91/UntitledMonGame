const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession } = require('../reusable.js');

const { getYourBattles } = require('./your_battles.js');

const apiYourBattlesSubmit = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg,/* obj.extra.toString() */));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(getYourBattles)
		.then(handleSubmission)
		.then(getYourBattles)
		.then(fields => { return { msg: { battles: fields.battleStructure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

const handleSubmission = (fields) => new Promise(async (resolve, reject) => {
	if (!fields.meta) {
		return reject({ msg: 'No meta field for your battles submit', extra: '' });
	}

	//closure
	const handleSubmissionAction = async (action, position) => {
		//no action taken in this position
		if (!action) {
			return;
		}

		switch(action.type) {
			case 'swap':
				if (action.swapSlot !== null && !fields.battleStructure[fields.index].yourTeam[action.swapSlot]) {
					return reject({ msg: 'swapSlot out of range', extra: action.swapSlot });
				}

				await pool.promise().query('UPDATE battleBoxSlots SET activePosition = "none" WHERE battleBoxId IN (SELECT id FROM battleBoxes WHERE battleId = ? AND profileId IN (SELECT id FROM profiles WHERE accountId = ?)) AND activePosition = ?', [fields.battleStructure[fields.index].id, fields.id, position]);

				if (action.swapSlot) {
					await pool.promise().query('UPDATE battleBoxSlots SET activePosition = ? WHERE id = ?;', [position, fields.battleStructure[fields.index].yourTeam[action.swapSlot].bbsId]);
				}

				return;

			default:
				return reject({ msg: 'Unknown action type', extra: [action.type] });
		}
	};

	//must have at least one creature on the field
	//NOTE: this is ugly - don't trust yourself to code while tired
	const topIsMissingNextTurn = (fields.meta.top && fields.meta.top.type == 'swap' && fields.meta.top.swapSlot === null) || !fields.battleStructure[fields.index].yourTopCreature;
	const bottomIsMissingNextTurn = (fields.meta.bottom && fields.meta.bottom.type == 'swap' && fields.meta.bottom.swapSlot === null) || !fields.battleStructure[fields.index].yourBottomCreature;
	const topIsSwappingNextTurn = fields.meta.top && fields.meta.top.type == 'swap' && fields.meta.top.swapSlot !== null;
	const bottomIsSwappingNextTurn = fields.meta.bottom && fields.meta.bottom.type == 'swap' && fields.meta.bottom.swapSlot !== null;

	if (topIsMissingNextTurn && !topIsSwappingNextTurn && bottomIsMissingNextTurn && !bottomIsSwappingNextTurn) {
		return reject({ msg: 'Must have at least one creature on the field', extra: '' });
	}

	//process each slot
	await handleSubmissionAction(fields.meta.bottom, 'bottom');
	await handleSubmissionAction(fields.meta.top, 'top');

	return resolve(fields);
});

module.exports = {
	apiYourBattlesSubmit,

	//for testing
	handleSubmission,
};