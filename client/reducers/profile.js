import { SET_PROFILE } from "../actions/profile.js";

const initialStore = {
	username: '',
	coins: 0,
};

export const profileReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_PROFILE: {
			let newStore = JSON.parse(JSON.stringify(initialStore));

			newStore.username = action.username;
			newStore.coins = action.coins;

			return newStore;
		}

		default:
			return store;
	};
}

