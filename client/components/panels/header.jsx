import React from 'react';
import { Button } from 'react-bootstrap';

class Header extends React.Component {
	render() {
		return (
			<header className='page-header centered'>
				<h1>Untitled Mon Game</h1>
				<div className='navbar'>
					<Button href='/login'>Login</Button>
					<Button href='/signup'>Signup</Button>
					<Button href='/recover'>Recover</Button>
				</div>
			</header>
		);
	}
};

export default Header;