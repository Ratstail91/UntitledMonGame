import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Button from '../button';

import LogoutButton from './logout_button';
import { RouterProps, RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

export interface OwnProps {
	// propFromParent: number
}

interface StateProps {
	loggedIn: boolean
}
	
interface DispatchProps {
	// onSomeEvent: () => void
}
   
// All of the props combined
type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps
   
// Internal state
interface State {
	// internalComponentStateField: string
}

class Header extends React.Component<Props, State> {
	render() {
		if (this.props.loggedIn) {
			return this.renderLoggedIn();
		} else {
			return this.renderLoggedOut();
		}
	}

	renderLoggedIn() {
		return (
			<header className='page-header centered'>
				<Link to='/'><span className='centered'><strong><h1>Egg Trainer</h1></strong></span></Link>
				<div className='navbar'>
					<Button to='/yourprofile'>Profile</Button>
					<div className='gap' />
					<Button to='/shop'>Shop</Button>
					<div className='gap' />
					<Button to='/passwordchange'>Password</Button>
					<div className='gap' />
					<Button to='/privacysettings'>Privacy</Button>
					<div className='gap' />
					<LogoutButton onClick={() => this.props.history.push('/')} />
				</div>
			</header>
		);
	}

	renderLoggedOut() {
		return (
			<header className='page-header centered'>
				<Link to='/'><span className='centered'><strong><h1>Egg Trainer</h1></strong></span></Link>
				<div className='navbar'>
					<Button to='/login'>Login</Button>
					<div className='gap' />
					<Button to='/signup'>Signup</Button>
					<div className='gap' />
					<Button to='/passwordrecover'>Recover</Button>
				</div>
			</header>
		);
	}
};

function mapStoreToProps(store, ownProps: OwnProps): StateProps {
	return {
		loggedIn: store.account.id !== undefined && store.account.id !== 0
	}
};

function mapDispatchToProps(dispatch: Dispatch<any>,  ownProps: OwnProps): DispatchProps {
	return {
		//
	}
};
 

export default withRouter(
	connect<StateProps, DispatchProps, OwnProps>(mapStoreToProps, mapDispatchToProps)(Header)
);