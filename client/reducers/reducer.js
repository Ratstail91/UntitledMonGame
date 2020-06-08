import { combineReducers } from 'redux';
import { accountReducer } from './account';
import { profileReducer } from './profile';
import { inspectReducer } from './inspect';
import { battlesReducer } from './battles';
import { warningReducer } from './warning';

//compile all reducers together
export default combineReducers({
	account: accountReducer,
	profile: profileReducer,
	inspect: inspectReducer,
	battles: battlesReducer,
	warning: warningReducer,
});
