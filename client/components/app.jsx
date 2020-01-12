import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

//styling
import 'bootstrap/dist/css/bootstrap.min.css';

//warning manipulation
import { connect } from 'react-redux';
import { setWarning } from '../actions/warning.js';

//components
import Warning from './panels/warning.jsx';
import Header from './panels/header.jsx';
import Footer from './panels/footer.jsx';

//lazy route loading (with error handling)
let LazyRoute = (lazyProps) => {
	const component = Loadable({
		loader: lazyProps.component,

		loading: (props) => {
			//handle lazy errors/warnings
			if (props.error) {
				lazyProps.setWarning(props.error);
			} else if (props.timedOut) {
				lazyProps.setWarning('Timed Out');
			} else if (props.pastDelay) {
				return (
					<div className='page'>
						<p className='centered'>Loading...</p>
					</div>
				);
			}

			return null;
		},
		timeout: 10000
	});

	return <Route {...lazyProps} component={component} />;
};

//connect LazyRoute instead of app (for messing with state for warning)
const mapStoreToProps = store => {
	return {
		warningText: store.warning.text
	}
}

const mapDispatchToProps = dispatch => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	}
}

LazyRoute = connect(mapStoreToProps, mapDispatchToProps)(LazyRoute);

//the app class
class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<BrowserRouter>
				<Header />
				<div className='central'>
					<Warning />
					<Switch>
						<LazyRoute exact path='/' component={() => import('./pages/home.jsx')} />

						<LazyRoute path='/signup' component={() => import('./pages/signup.jsx')} />
						<LazyRoute path='/login' component={() => import('./pages/login.jsx')} />

						<LazyRoute path='*' component={() => import('./pages/page_not_found.jsx')} />
					</Switch>
				</div>
			<Footer />
			</BrowserRouter>
		);
	}
}

export default App;
