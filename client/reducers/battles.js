import { SET_BATTLE_BOXES } from "../actions/battles.js";

const initialStore = {
	battleBoxes: []
};

export const battlesReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_BATTLE_BOXES: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.battleBoxes = JSON.parse(JSON.stringify(action.battleBoxes));

			return newStore;
		}

		default:
			return store;
	};
}
