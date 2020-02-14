import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from '../button.jsx';

//panels
import LoginPanel from '../panels/login.jsx';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (this.props.loggedIn) {
			this.props.history.push('/');
		}
	}

	//TODO: redirect to profile
	render() {
		return (
			<div className='page constrained'>
				<LoginPanel onSuccess={(msg) => this.props.history.push('/')} />
				<Button href='/' className='centered'>Return Home</Button>
			</div>
		);
	}
};

const mapStoreToProps = (store) => {
	return {
		loggedIn: !!store.account.id
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
};

Login = connect(mapStoreToProps, mapDispatchToProps)(Login);

export default withRouter(Login);