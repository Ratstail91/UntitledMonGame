import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import App from './components/app';

import reducer from './reducers/reducer';

//persistence
let ACCOUNT = 'account.eggtrainer';
let account:any = localStorage.getItem(ACCOUNT);
account = account ? JSON.parse(account) : {};

//BUGFIX: Reloading on the move selection page loses the creature ID
let INSPECT = 'inspect.eggtrainer';
let inspect = localStorage.getItem(INSPECT);
inspect = inspect ? JSON.parse(inspect) : {};

var store = createStore(
	reducer,
	{ account, inspect }, //initial state
	applyMiddleware(thunk)
);

//persistence
store.subscribe(() => {
	localStorage.setItem(ACCOUNT, JSON.stringify(store.getState().account));
	localStorage.setItem(INSPECT, JSON.stringify(store.getState().inspect));
});

//start the process
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#root')
);
