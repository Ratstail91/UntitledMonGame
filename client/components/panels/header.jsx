import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Button from '../button.jsx';

import LogoutButton from './logout_button.jsx';

class Header extends React.Component {
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
				<h1>Untitled Mon Game</h1>
				<div className='navbar'>
					<LogoutButton onClick={() => this.props.history.push('/')} />
					<Button to='/passwordchange'>Password</Button>
				</div>
			</header>
		);
	}

	renderLoggedOut() {
		return (
			<header className='page-header centered'>
				<h1>Untitled Mon Game</h1>
				<div className='navbar'>
					<Button to='/login'>Login</Button>
					<Button to='/signup'>Signup</Button>
					<Button to='/recover'>Recover</Button>
				</div>
			</header>
		);
	}
};

function mapStoreToProps(store) {
	return {
		loggedIn: store.account.id !== undefined && store.account.id !== 0
	}
};

function mapDispatchToProps(dispatch) {
	return {
		//
	}
};

Header = connect(mapStoreToProps, mapDispatchToProps)(Header);

export default withRouter(Header);