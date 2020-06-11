export const SET_BATTLE_BOXES = 'SET_BATTLE_BOXES';
export const SET_BATTLES = 'SET_BATTLES';
export const SET_CREATURE = 'SET_CREATURE';

export const setBattleBoxes = (battleBoxes) => {
	return {
        type: SET_BATTLE_BOXES,
        battleBoxes: battleBoxes
	};
};

export const setBattles = (battles) => {
	return {
		type: SET_BATTLES,
		battles: battles
	};
};

export const setCreature = (battleIndex, positionName, creature) => {
	return {
		type: SET_CREATURE,
		battleIndex: battleIndex,
		positionName: positionName,
		creature: creature
	};
};
