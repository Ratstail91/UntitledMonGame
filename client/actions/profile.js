export const SET_PROFILE = 'SET_PROFILE';
export const SET_EGGS = 'SET_EGGS';

export const setProfile = (username, coins) => {
	return {
		type: SET_PROFILE,
		username: username,
		coins: coins
	};
};

export const setEggs = (eggs) => {
	return {
		type: SET_EGGS,
		eggs: eggs
	}
};