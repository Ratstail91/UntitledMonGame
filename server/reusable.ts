import { log, logActivity } from './utilities/logging';
import pool from './utilities/database';

import species from './gameplay/species.json';
import itemIndex from './gameplay/item_index.json';
import premiumIndex from './gameplay/premium_index.json';

//@ts-nocheck

//reusable
export const determineSelectedEgg = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(egg => egg ? resolve({ egg, ...fields }) : reject({ msg: 'egg not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedEgg error', extra: e }))
	;
});

//NOTE: for display only
export const getYourEggs = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT *, TIMEDIFF(incubationTime, NOW()) AS hatchTime FROM creatureEggs WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then((eggs: any) => resolve({ eggs: eggs.map(egg => { return { id: egg.id, element: species[egg.species].element, hatchTime: egg.hatchTime }}), ...fields }))
		.catch(e => reject({ msg: 'getYourEggs error', extra: e }))
	;
});

export const determineSelectedCreature = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND id NOT IN (SELECT creatureId FROM battleBoxSlots) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(creature => creature ? resolve({ creature, ...fields }) : reject({ msg: 'creature not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedCreature error', extra: e }))
	;
});

//NOTE: for display only
export const getYourCreatures = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT *, TIMEDIFF(trainingTime, NOW()) AS trainingTime FROM creatures WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND id NOT IN (SELECT creatureId FROM battleBoxSlots) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then((creatures: any) => resolve({ creatures: creatures.map(creature => {
			return {
				id: creature.id,
				species: creature.species,
				name: species[creature.species].name,
				element: species[creature.species].element,
				description: species[creature.species].description,
				breeding: creature.breeding,
				trainingTime: creature.trainingTime,
				frontImage: species[creature.species].frontImage,
			}
		}), ...fields }))
		.catch(e => reject({ msg: 'getYourCreatures error', extra: e }))
	;
});

export const determineSelectedItem = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT * FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0][fields.index])
		.then(item => item ? resolve({ item, ...fields }) : reject({ msg: 'item not found', extra: fields.index }))
		.catch(e => reject({ msg: 'determineSelectedItem error', extra: e }))
	;
});

//NOTE: for display only
export const getYourItems = (fields) => new Promise((resolve, reject) => {
	const query = 'SELECT id, idx FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;';
	return pool.promise().query(query, [fields.id])
		.then(results => results[0])
		.then((items: any) => resolve({ items: items.map(item => { return { idx: item.idx, id: item.id, ... (itemIndex[item.idx] || premiumIndex[item.idx]) }}), ...fields }))
		.catch(e => reject({ msg: 'getYourItems error', extra: e }))
	;
});

export const getCreatureMoves = (fields) => new Promise(async (resolve, reject) => {
	const ownedQuery = 'SELECT idx FROM creatureMovesOwned WHERE creatureId = ?;';
	const equippedQuery = 'SELECT idx FROM creatureMovesOwned WHERE creatureId = ? AND equipped = TRUE;';

	const available = species[fields.creature.species].moves;
	const owned = (await pool.promise().query(ownedQuery, [fields.creature.id]))[0];
	const equipped = (await pool.promise().query(equippedQuery, [fields.creature.id]))[0];

	return resolve({ available, owned, equipped });
});
