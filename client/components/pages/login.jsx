import React from 'react';
import { withRouter, Link } from 'react-router-dom';

//panels
import LoginPanel from '../panels/login.jsx';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			//
		}
	}

	render() {
		return (
			<div className='page constrained'>
				<LoginPanel onSuccess={(msg) => this.props.history.push('/profile')} />
				<Link to='/' className='centered'>Return Home</Link>
			</div>
		);
	}
};

export default withRouter(Login);