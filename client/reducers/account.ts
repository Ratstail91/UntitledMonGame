import { LOGIN, LOGOUT, SESSION_CHANGE } from "../actions/account";

export interface AccountStore {
	id: number;
	token: number;
}

const initialStore: AccountStore = {
	id: 0,
	token: 0
};

export const accountReducer = (store: AccountStore = initialStore, action) => {
	switch(action.type) {
		case LOGIN: {
			let newStore = {
				...store,
				id: action.id,
				token: action.token
			}

			return newStore;
		}

		case LOGOUT:
			return initialStore;

		case SESSION_CHANGE: {
			let newStore = {
				...store,
				token: action.token
			}

			return newStore;
		}

		default:
			return store;
	};
}
