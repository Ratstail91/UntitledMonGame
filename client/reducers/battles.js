import { SET_BATTLE_BOXES, SET_BATTLES } from "../actions/battles.js";

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

		default:
			return store;
	};
}
