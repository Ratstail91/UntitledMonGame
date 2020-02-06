import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import DevTools from './dev_tools.jsx';
import App from './components/app.jsx';

import reducer from './reducers/reducer.js';

//persistence
let ITEM_NAME = 'account.eggtrainer';
let account = localStorage.getItem(ITEM_NAME);
account = account ? JSON.parse(account) : {};

//BUGFIX: Reloading on the move selection page loses the creature ID
let INSPECT = 'inspect.eggtrainer';
let inspect = localStorage.getItem(INSPECT);
inspect = inspect ? JSON.parse(inspect) : {};

var store = createStore(
	reducer,
	{ account, inspect }, //initial state
	compose(
		applyMiddleware(thunk),
		DevTools.instrument()
	)
);

//persistence
store.subscribe(() => {
	localStorage.setItem(ITEM_NAME, JSON.stringify(store.getState().account));
	localStorage.setItem(INSPECT, JSON.stringify(store.getState().inspect));
});

//start the process
ReactDOM.render(
	<Provider store={store}>
		<div>
			<App />
			<DevTools />
		</div>
	</Provider>,
	document.querySelector('#root')
);
