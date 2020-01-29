import { SET_PROFILE, SET_EGGS, SET_ITEMS } from "../actions/profile.js";

const initialStore = {
	username: '',
	coins: 0,
	eggs: [],
	items: [],
};

export const profileReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_PROFILE: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.username = action.username;
			newStore.coins = action.coins;

			return newStore;
		}

		case SET_EGGS: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.eggs = JSON.parse(JSON.stringify(action.eggs));

			return newStore;
		}

		case SET_ITEMS: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.items = JSON.parse(JSON.stringify(action.items));

			return newStore;
		}

		default:
			return store;
	};
}
