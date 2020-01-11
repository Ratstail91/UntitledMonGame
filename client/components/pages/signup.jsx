import React from 'react';
import { Button } from 'react-bootstrap';

//panels
import SignupPanel from '../panels/signup.jsx';

class Signup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			signedUp: '' //the signup message from the server
		}

		//TODO: referral links
	}

	render() {
		let Panel;

		if (!this.state.signedUp) {
			Panel = () => {
				return (<SignupPanel onSuccess={msg => this.setState({signedUp: msg}) } />);
			}
		} else {
			Panel = () => {
				return (<p className='centered'>{this.state.signedUp}</p>);
			}
		}

		return (
			<div className='page constrained'>
				<Panel />
				<Button href='/' className='centered'>Return Home</Button>
				<div className='break' />
				<p className='centered'><em>(Remember to verify your email!)</em></p>
			</div>
		);
	}
};

export default Signup;