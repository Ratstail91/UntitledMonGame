import { combineReducers } from 'redux';
import { accountReducer } from './account.js';
import { profileReducer } from './profile.js';
import { inspectReducer } from './inspect.js';
import { warningReducer } from './warning.js';

//compile all reducers together
export default combineReducers({
	account: accountReducer,
	profile: profileReducer,
	inspect: inspectReducer,
	warning: warningReducer,
});

