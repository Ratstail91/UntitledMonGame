const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourItems } = require('../reusable.js');

const { getBattleBoxes, getBattleBoxSlots } = require('./battle_tools.js');

const speciesIndex = require('../gameplay/species.json');
const movesIndex = require('../gameplay/moves.json');
const itemIndex = require('../gameplay/item_index.json');
const premiumIndex = require('../gameplay/premium_index.json');

const apiYourBattles = async (req, res) => {
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
		.then(getYourBattles)
		.then(fields => { return { msg: { battles: fields.battleStructure }, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

//TODO: (0) reusable?
const getYourBattles = (fields) => new Promise(async (resolve, reject) => {

	//get your battles
	const battleQuery = 'SELECT * FROM battles WHERE id IN (SELECT battleId FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?)) AND status != "open";';
	const battles = (await pool.promise().query(battleQuery, [fields.id]))[0];

	const battleBoxes = await getBattleBoxes(fields.id);

	const yourItems = (await getYourItems(fields)).items;

	const battleStructure = await Promise.all(battles.map(async (battle) => {
		//get the box & slots for this battle
		const battleBox = battleBoxes.filter(bb => bb.battleId == battle.id)[0];
		const battleBoxSlots = await getBattleBoxSlots(battleBox.id);
		const creatures = await Promise.all(battleBoxSlots.map(async bbs => (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', bbs.creatureId))[0][0] ));
		const enemyCreatures = await getEnemyCreatures(fields.id, battle.id);

		const yourTop = creatures.filter(c => { const s = battleBoxSlots.filter(bbs => bbs.activePosition == 'top')[0]; return s && c.id == s.creatureId; })[0];
		const yourBottom = creatures.filter(c => { const s = battleBoxSlots.filter(bbs => bbs.activePosition == 'bottom')[0]; return s && c.id == s.creatureId; })[0];

		//get the exhausted items from this battle
		const exhaustedItems = await getExhaustedItems(fields.id, battle.id);
		let itemPopulation = {};

		yourItems.filter(i => i.type == 'consumable').forEach(yourItem => {
			itemPopulation[yourItem.idx] = {
				idx: yourItem.idx,
				name: yourItem.name,
				exhausted: false,
			};
		});

		exhaustedItems.forEach(yourExhautedItem => {
			itemPopulation[yourExhautedItem.idx] = {
				idx: yourExhautedItem.idx,
				name: itemIndex[yourExhautedItem] ? itemIndex[yourExhautedItem.idx].name : premiumIndex[yourExhautedItem.idx].name,
				exhausted: true,
			};
		})

		//return the full structure for this battle
		return {
			id: battle.id,

			yourTopCreature: await getStats(yourTop),
			yourBottomCreature: await getStats(yourBottom),

			yourTeam: battleBoxSlots.filter(bbs => bbs.activePosition == 'none').map(bbs => {
				const creature = creatures.filter(c => c.id == bbs.creatureId)[0];

				return {
					bbsId: bbs.id,
					name: creature.nickname || speciesIndex[creature.species].name,
					maxHP: bbs.maximumHealth,
					currentHP: bbs.currentHealth,
				};
			}),

			yourItems: Object.values(itemPopulation),

			enemyTopCreature: await getStats(enemyCreatures.top),
			enemyBottomCreature: await getStats(enemyCreatures.bottom),

			logs: [
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			] //TODO
		};
	}));

		/*

		battle: {
			yourTopCreature: {
				frontImage: 'image.png',
				name: 'nickname || species',
				maxHP: 10,
				currentHP: 10,
				moves: [
					{ name: 'Tackle', idx: 'tackle', exhausted: true }
				]
			},
			yourButtonCreature: {
				//duplicate of yourTopCreature
			},

			yourTeam: [
				{ name: 'Creature', maxHP, currentHP },
				//up to 6
			],

			items: [
				{ name: 'Golden Apple', idx: 'goldenapple', exhausted: true }
			],
			enemyTopCreature: {
				frontImage: 'image.png',
				name: 'nickname || species',
				maxHP: 10,
				currentHP: 10,
			},
			enemyBottomCreature: {
				//duplicate of enemyTopCreature
			},

			logs: [ "text" ]
		}

		*/

	return resolve({ ...fields, battleStructure });
});

//utils
const getExhaustedItems = async (accountId, battleId) => {
	const query = 'SELECT * FROM exhaustedBattleItems WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND battleId = ?;';
	return (await pool.promise().query(query, [accountId, battleId]))[0];
};

const getEnemyCreatures = async (notAccountId, battleId) => {
	const battleBoxQuery = 'SELECT * FROM battleBoxes WHERE profileId NOT IN (SELECT id FROM profiles WHERE accountId = ?) AND battleId = ?;';
	const battleBox = (await pool.promise().query(battleBoxQuery, [notAccountId, battleId]))[0][0];

	if (!battleBox) {
		return { top: null, bottom: null };
	}process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

	const slotsQuery = 'SELECT * FROM battleBoxSlots WHERE battleBoxId = ?;';
	const battleBoxSlots = (await pool.promise().query(slotsQuery, [battleBox.id]))[0];

	const t = battleBoxSlots.filter(bbs => bbs.activePosition == 'top')[0];
	const b = battleBoxSlots.filter(bbs => bbs.activePosition == 'bottom')[0];

	const topId = t ? t.creatureId : null;
	const bottomId = b ? b.creatureId : null;

	const top = topId ? (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', topId))[0][0] : null;
	const bottom = bottomId ? (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', bottomId))[0][0] : null;

	return {
		top, bottom
	};
};

//utils
const getStats = async (creature) => {
	if (!creature) {
		return null;
	}

	const slot = (await pool.promise().query('SELECT * FROM battleBoxSlots WHERE creatureId = ?;', [creature.id]))[0][0];
	const moves = (await pool.promise().query('SELECT * FROM creatureMovesOwned WHERE creatureId = ? AND equipped = TRUE;', [creature.id]))[0];

	return {
		frontImage: speciesIndex[creature.species].frontImage, //TODO: cosmetics
		name: creature.nickname || speciesIndex[creature.species].name,
		maxHP: slot.maximumHealth,
		currentHP: slot.currentHealth,
		moves: moves.map(m => { return { name: movesIndex[m.idx].name, idx: m.idx, exhausted: false }; })
	};

	//TODO: move exhaustion
}

module.exports = {
	apiYourBattles,
	getYourBattles,

	//for testing
	//
};