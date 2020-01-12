import React from 'react';
import { Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

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

	componentDidMount() {
		if (this.props.loggedIn) {
			this.props.history.push('/');
		}
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

const mapStoreToProps = (store) => {
	return {
		loggedIn: store.account.id !== 0
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
};

Signup = connect(mapStoreToProps, mapDispatchToProps)(Signup);

export default withRouter(Signup);