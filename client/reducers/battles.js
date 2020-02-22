import {
	SET_BATTLE_BOXES,
	SET_BATTLES,
	SET_CREATURE,
} from "../actions/battles.js";

const initialStore = {
	battleBoxes: [],
	battles: []
};

export const battlesReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_BATTLE_BOXES: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.battleBoxes = JSON.parse(JSON.stringify(action.battleBoxes));

			return newStore;
		}

		case SET_BATTLES: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.battles = JSON.parse(JSON.stringify(action.battles));

			return newStore;
		}

		case SET_CREATURE: {
			let newStore = JSON.parse(JSON.stringify(store));

			let newCreature = JSON.parse(JSON.stringify(action.creature));

			if (action.positionName == 'top') {
				newStore.battles[action.battleIndex].yourTopCreature = newCreature;
			}

			if (action.positionName == 'bottom') {
				newStore.battles[action.battleIndex].yourBottomCreature = newCreature;
			}

			return newStore;
		}

		default:
			return store;
	};
}
