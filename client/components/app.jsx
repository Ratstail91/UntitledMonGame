import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';

//other stuff
import Footer from './panels/footer.jsx';

//lazy route loading (with error handling)
const LazyRoute = (props) => {
	const component = Loadable({
		loader: props.component,

		loading: (props) => {
			if (props.error) {
				return (
					<div className='page'>
						<div className='warning' style={{display: 'flex'}}>
							<p className='centered'>{props.error}</p>
						</div>
					</div>
				);
			} else if (props.timedOut) {
				return (
					<div className='page'>
						<div className='warning' style={{display: 'flex'}}>
							<p className='centered'>Timed Out</p>
						</div>
					</div>
				);
			} else if (props.pastDelay) {
				return (
					<div className='page'>
						<p className='centered'>Loading...</p>
					</div>
				);
			} else {
				return null;
			}
		},
		timeout: 10000
	});

	return <Route {...props} component={component} />;
};

//the app class
export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<div>
				<div className = 'central'>
					<BrowserRouter>
						<Switch>
							<LazyRoute exact path='/' component={() => import('./pages/home.jsx')} />

							<LazyRoute path='*' component={() => import('./pages/page_not_found.jsx')} />
						</Switch>
					</BrowserRouter>
				</div>
				<Footer />
			</div>
		);
	}
}