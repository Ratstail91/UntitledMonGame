const { log, logActivity } = require('./utilities/logging.js');
const pool = require("./utilities/database.js");

const species = require('./gameplay/species.json');
const itemIndex = require('./gameplay/item_index.json');
const premiumIndex = require('./gameplay/premium_index.json');

//reusable
const validateSession = (fields) => new Promise(async (resolve, reject) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';
	return pool.promise().query(query, [fields.id, fields.token])
		.then(results => results[0].length > 0 ? fields : reject({ msg: 'Session Timed Out', extra: fields }))
		.then(fields => { logActivity(fields.id); resolve(fields); })
		.catch(e => reject({ msg: 'validateSession error', extra: e }))
	;
});

const determineSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(egg => egg ? resolve({ egg, ...fields }) : reject({ msg: 'egg not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedEgg error', extra: e }))
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

const determineSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND id NOT IN (SELECT creatureId FROM battleBoxSlots) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(creature => creature ? resolve({ creature, ...fields }) : reject({ msg: 'creature not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedCreature error', extra: e }))
	;
});

//NOTE: for display only
const getYourCreatures = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND id NOT IN (SELECT creatureId FROM battleBoxSlots) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(creatures => resolve({ creatures: creatures.map(creature => {
			return {
				id: creature.id,
				species: creature.species,
				name: species[creature.species].name,
				element: species[creature.species].element,
				description: species[creature.species].description,
				breeding: creature.breeding,
				frontImage: species[creature.species].frontImage,
			}
		}), ...fields }))
		.catch(e => reject({ msg: 'getYourCreatures error', extra: e }))
	;
});

const determineSelectedItem = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(item => item ? resolve({ item, ...fields }) : reject({ msg: 'item not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedItem error', extra: e }))
	;
});

//NOTE: for display only
const getYourItems = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id, idx FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then(items => resolve({ items: items.map(item => { return { id: item.id, ... (itemIndex[item.idx] || premiumIndex[item.idx]) }}), ...fields }))
		.catch(e => reject({ msg: 'getYourItems error', extra: e }))
	;
});

const getCreatureMoves = (fields) => new Promise(async (resolve, reject) => {
	const ownedQuery = 'SELECT idx FROM creatureMovesOwned WHERE creatureId = ?;';
	const equippedQuery = 'SELECT idx FROM creatureMovesOwned WHERE creatureId = ? AND equipped = TRUE;';

	const available = species[fields.creature.species].moves;
	const owned = (await pool.promise().query(ownedQuery, [fields.creature.id]))[0];
	const equipped = (await pool.promise().query(equippedQuery, [fields.creature.id]))[0];

	return resolve({ available, owned, equipped });
});

module.exports = {
	validateSession,
	determineSelectedEgg,
	getYourEggs,
	determineSelectedCreature,
	getYourCreatures,
	determineSelectedItem,
	getYourItems,
	getCreatureMoves,
};