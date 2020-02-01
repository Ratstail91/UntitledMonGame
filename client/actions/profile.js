export const SET_PROFILE = 'SET_PROFILE';
export const SET_CREATURES = 'SET_CREATURES';
export const SET_EGGS = 'SET_EGGS';
export const SET_ITEMS = 'SET_ITEMS';

export const setProfile = (username, coins) => {
	return {
		type: SET_PROFILE,
		username: username,
		coins: coins
	};
};

export const setCreatures = (creatures) => {
	return {
		type: SET_CREATURES,
		creatures: creatures
	}
}

export const setEggs = (eggs) => {
	return {
		type: SET_EGGS,
		eggs: eggs
	}
};

export const setItems = (items) => {
	return {
		type: SET_ITEMS,
		items: items
	}
}