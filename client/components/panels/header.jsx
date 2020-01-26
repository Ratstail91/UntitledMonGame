import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Button from '../button.jsx';

import LogoutButton from './logout_button.jsx';
import ServerTime from './server_time.jsx';

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
				<ServerTime />
				<Link to='/'><span className='centered'><strong><h1>Egg Trainer</h1></strong></span></Link>
				<div className='navbar'>
					<Button to='/yourprofile'>Profile</Button>
					<div className='gap' />
					<Button to='/shop'>Shop</Button>
					<div className='gap' />
					<LogoutButton onClick={() => this.props.history.push('/')} />
					<div className='gap' />
					<Button to='/passwordchange'>Password</Button>
					<div className='gap' />
					<Button to='/privacysettings'>Privacy</Button>
				</div>
			</header>
		);
	}

	renderLoggedOut() {
		return (
			<header className='page-header centered'>
				<ServerTime />
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