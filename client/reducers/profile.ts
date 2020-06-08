import { SET_PROFILE, SET_CREATURES, SET_EGGS, SET_ITEMS } from '../actions/profile';


// TODO: Add egg and creature types
export interface ProfileStore{
	username: string;
	coins: number;
	creatures: Array<any>;
	eggs: Array<any>;
	items: Array<any>;
}

const initialStore: ProfileStore = {
	username: '',
	coins: 0,
	creatures: [],
	eggs: [],
	items: [],
};

export const profileReducer = (store: ProfileStore = initialStore, action: Partial<ProfileStore> & {type:string}) => {
	switch(action.type) {
		case SET_PROFILE: {
			let newStore: ProfileStore = {
				...store,
				username: action.username,
				coins: action.coins
			}

			return newStore;
		}

		case SET_CREATURES: {
			let newStore: ProfileStore = {
				...store,
				creatures: JSON.parse(JSON.stringify(action.creatures))
			}

			return newStore;
		}

		case SET_EGGS: {
			let newStore: ProfileStore = {
				...store,
				eggs: JSON.parse(JSON.stringify(action.eggs))
			}
			return newStore;
		}

		case SET_ITEMS: {
			let newStore: ProfileStore = {
				...store,
				items: JSON.parse(JSON.stringify(action.items))
			}

			return newStore;
		}

		default:
			return store;
	};
}
