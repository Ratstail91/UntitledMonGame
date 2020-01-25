export const SET_PROFILE = 'SET_PROFILE';

export const setProfile = (username, coins) => {
	return {
		type: SET_PROFILE,
		username: username,
		coins: coins
	};
}
