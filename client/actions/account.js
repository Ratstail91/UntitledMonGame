export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const SESSION_CHANGE = 'SESSION_CHANGE';

export const login = (id, token) => {
	return {
		type: LOGIN,
		id: id,
		token: token
	};
}

export const logout = () => {
	return {
		type: LOGOUT
	};
}

//TODO: change session when password changed?
//TODO: expire sessions
export const sessionChange = token => {
	return {
		type: SESSION_CHANGE,
		token: token
	};
}