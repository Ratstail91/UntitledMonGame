export const SET_BATTLE_BOXES = 'SET_BATTLE_BOXES';

export const setBattleBoxes = (battleBoxes) => {
	return {
        type: SET_BATTLE_BOXES,
        battleBoxes: battleBoxes
	};
};
