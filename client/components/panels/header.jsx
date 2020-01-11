import React from 'react';
import Button from '../button.jsx';

class Header extends React.Component {
	render() {
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

export default Header;