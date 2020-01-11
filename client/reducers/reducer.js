import { combineReducers } from 'redux';
import { accountReducer } from './account.js';
import { warningReducer } from './warning.js';

//compile all reducers together
export default combineReducers({
	account: accountReducer,
	warning: warningReducer
});

