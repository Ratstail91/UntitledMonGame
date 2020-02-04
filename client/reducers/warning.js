import { SET_WARNING } from "../actions/warning.js";

const initialStore = {
	text: '',
	//TODO: HTTP error codes
};

export const warningReducer = (store = initialStore, action) => {
	switch(action.type) {
		case SET_WARNING: {
			let newStore = JSON.parse(JSON.stringify(initialStore));

			newStore.text = action.text

			return newStore;
		}

		default:
			return store;
	};
}
