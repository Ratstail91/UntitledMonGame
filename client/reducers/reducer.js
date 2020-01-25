import { combineReducers } from 'redux';
import { accountReducer } from './account.js';
import { profileReducer } from './profile.js';
import { warningReducer } from './warning.js';

//compile all reducers together
export default combineReducers({
	account: accountReducer,
	profile: profileReducer,
	warning: warningReducer,
});

