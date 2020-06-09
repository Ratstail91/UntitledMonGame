import pool from '../utilities/database';

import speciesIndex from '../gameplay/species.json';

//utilities
const clamp = (x, lower, upper) => {
    return Math.max(lower, Math.min(upper, x));
}

export const countTotalBattleBoxItems = async (accountId) => {
	const query = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = ?;';
	return (await pool.promise().query(query, [accountId, 'battlebox']))[0][0].total;
};

export const getBattleBoxes = async (accountId) => {
	let battleBoxes: any  = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [accountId]))[0];
	const totalBattleBoxes = await countTotalBattleBoxItems(accountId);

	//if there are more item battleboxes than DB battle boxes
	if (battleBoxes.length != totalBattleBoxes) {
		const query = 'INSERT INTO battleBoxes (profileId) VALUES ((SELECT id FROM profiles WHERE accountId = ?));';
		for (let i = 0; i < totalBattleBoxes - battleBoxes.length; i++) {
			await pool.promise().query(query, [accountId]);
		}

		//grab new battleboxes
		battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [accountId]))[0];
	}

	return battleBoxes;
};

export const getBattleBoxSlots = async (boxId): Promise<any> => {
	return (await pool.promise().query('SELECT * FROM battleBoxSlots WHERE battleBoxId = ? ORDER BY boxSlot ASC;', boxId))[0];
};

export const activateFirstTwoSlots = async (boxId) => {
	const battleBoxSlots = await getBattleBoxSlots(boxId);

	await pool.promise().query('UPDATE battleBoxSlots SET activePosition = "none" WHERE battleBoxId = ?;', boxId);

	if (battleBoxSlots[0]) {
		await pool.promise().query('UPDATE battleBoxSlots SET activePosition = "top" WHERE id = ?;', battleBoxSlots[0].id);
	}

	if (battleBoxSlots[1]) {
		await pool.promise().query('UPDATE battleBoxSlots SET activePosition = "bottom" WHERE id = ?;', battleBoxSlots[1].id);
	}
};

export const initializeBattleBox = async (boxId) => {
	const battleBoxSlots = await getBattleBoxSlots(boxId);

	battleBoxSlots.forEach(async (slot) => {
		const stats = await calcBaseStats(slot);

		const initQuery = 'UPDATE battleBoxSlots SET maximumHealth = ?, currentHealth = ?, currentSpeedMod = 0, currentStrengthMod = 0, currentPowerMod = 0, currentPhysicalAttackMod = 0, currentPhysicalDefenseMod = 0, currentMagicalAttackMod = 0, currentMagicalDefenseMod = 0 WHERE id = ?;';
		return pool.promise().query(initQuery, [stats.health, stats.health, slot.id]);
	});
};

export const calcBaseStats = async (slot) => {
	const creature = (await pool.promise().query('SELECT * FROM creatures WHERE id = ?;', slot.creatureId))[0][0];

	return {
		health: speciesIndex[creature.species].stats.health + creature.geneticPointsHealth + creature.statPointsHealth,
		speed: speciesIndex[creature.species].stats.speed + creature.geneticPointsSpeed + creature.statPointsSpeed,
		physicalAttack: speciesIndex[creature.species].stats.physicalAttack + creature.geneticPointsStrength + creature.statPointsStrength,
		physicalDefense: speciesIndex[creature.species].stats.physicalDefense + creature.geneticPointsStrength + creature.statPointsStrength,
		magicalAttack: speciesIndex[creature.species].stats.magicalAttack + creature.geneticPointsPower + creature.statPointsPower,
		magicalDefense: speciesIndex[creature.species].stats.magicalDefense + creature.geneticPointsPower + creature.statPointsPower,
	};
};

export const calcModifiedStats = async (slot) => {
	const base = await calcBaseStats(slot);

	const modifiers = { //TODO: api?
		'6': 3.33,
		'5': 3,
		'4': 2.67,
		'3': 2.33,
		'2': 2,
		'1': 1.5,
		'0': 1,
		'-1': 0.8,
		'-2': 0.6,
		'-3': 0.5,
		'-4': 0.4,
		'-5': 0.3,
		'-6': 0.2,
	};

	const spMod = clamp(slot.currentSpeedMod, -6, 6);
	const paMod = clamp(slot.currentStrengthMod + slot.currentPhysicalAttackMod, -6, 6);
	const pdMod = clamp(slot.currentStrengthMod + slot.currentPhysicalDefenseMod, -6, 6);
	const maMod = clamp(slot.currentPowerMod + slot.currentMagicalAttackMod, -6, 6);
	const mdMod = clamp(slot.currentPowerMod + slot.currentMagicalDefenseMod, -6, 6);

	return {
		maxHP: slot.maximumHealth,
		currentHP: slot.currentHealth,
		speed: modifiers[spMod.toString()] * base.speed,
		physicalAttack: modifiers[paMod.toString()] * base.physicalAttack,
		physicalDefense: modifiers[pdMod.toString()] * base.physicalDefense,
		magicalAttack: modifiers[maMod.toString()] * base.magicalAttack,
		magicalDefense:  modifiers[mdMod.toString()] * base.magicalDefense,
	};
};
