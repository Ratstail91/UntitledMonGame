import { SET_INSPECT } from "../actions/inspect";

const initialStore = {
	index: -1
};

export const inspectReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_INSPECT: {
			let newStore = JSON.parse(JSON.stringify(store));

			newStore.index = action.index;

			return newStore;
		}

		default:
			return store;
	};
}
