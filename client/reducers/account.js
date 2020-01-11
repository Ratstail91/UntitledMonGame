import { LOGIN, LOGOUT, SESSION_CHANGE } from "../actions/account.js";

const initialStore = {
	id: 0,
	email: '',
	username: '',
	token: 0
};

export const accountReducer = (store = initialStore, action) => {
	switch(action.type) {
		case LOGIN: {
			let newStore = JSON.parse(JSON.stringify(initialStore));

			newStore.id = action.id;
			newStore.email = action.email;
			newStore.username = action.username;
			newStore.token = action.token;

			return newStore;
		}

		case LOGOUT:
			return initialStore;

		case SESSION_CHANGE: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.token = action.token;

			return newStore;
		}

		default:
			return store;
	};
}

