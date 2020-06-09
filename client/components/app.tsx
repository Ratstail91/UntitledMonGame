import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

//styling
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/shared.css';

//warning manipulation
import { connect } from 'react-redux';
import { setWarning } from '../actions/warning';

//components
import Warning from './panels/warning';
import Header from './panels/header';
import Footer from './panels/footer';

import MarkdownWrapper from './pages/markdown_wrapper';

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
						<LazyRoute exact path='/' component={() => import('./pages/home')} />

						<LazyRoute exact path='/news' component={() => import('./pages/news')} />
						<LazyRoute exact path='/news/:article' component={() => import('./pages/news')} />

						<LazyRoute path='/signup' component={() => import('./pages/signup')} />
						<LazyRoute path='/login' component={() => import('./pages/login')} />
						<LazyRoute path='/passwordchange' component={() => import('./pages/password_change')} />
						<LazyRoute path='/passwordrecover' component={() => import('./pages/password_recover')} />
						<LazyRoute path='/passwordreset' component={() => import('./pages/password_reset')} />

						<LazyRoute path='/yourprofile' component={() => import('./pages/your_profile')} />
						<LazyRoute path='/inspect' component={() => import('./pages/inspect')} />
						<LazyRoute path='/movesselect' component={() => import('./pages/moves_select')} />
						<LazyRoute path='/shop' component={() => import('./pages/shop')} />
						<LazyRoute path='/challenge' component={() => import('./pages/challenge')} />

						<LazyRoute path='/privacysettings' component={() => import('./pages/privacy_settings')} />
						<LazyRoute path='/privacypolicy' component={async () => () => <MarkdownWrapper url={require('../markdown/privacy_policy.md').default} />} />
						<LazyRoute path='/credits' component={async () => () => <MarkdownWrapper url={require('../markdown/credits.md').default} />} />

						<LazyRoute path='/admin' component={() => import('./pages/admin')} />

						<LazyRoute path='*' component={() => import('./pages/page_not_found')} />
					</Switch>
				</div>
			<Footer />
			</BrowserRouter>
		);
	}
}

export default App;
