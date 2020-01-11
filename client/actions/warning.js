export const SET_WARNING = 'SET_WARNING';

export const setWarning = msg => {
	return {
		type: SET_WARNING,
		text: msg
	};
}
