import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import App from './components/app.jsx';

//import reducer from './reducers/reducer.js';
const reducer = x => x; //TODO: implement proper reducers

//persistence
let ITEM_NAME = 'account.mon';
let account = localStorage.getItem(ITEM_NAME);
account = account ? JSON.parse(account) : {};

var store = createStore(
	reducer,
	{ account: account }, //initial state
	applyMiddleware(thunk)
);

//persistence
store.subscribe(() => {
	localStorage.setItem(ITEM_NAME, JSON.stringify(store.getState().account));
});

//start the process
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#root')
);
