import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import Button from '../button.jsx';

//panels
import SignupPanel from '../panels/signup.jsx';

class Signup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			signedUp: '', //the signup message from the server
			search: queryString.parse(this.props.location.search),
		};
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
				return (<SignupPanel onSuccess={msg => this.setState({signedUp: msg}) } code={this.state.search.code} referral={this.state.search.referral} />);
			}
		} else {
			Panel = () => {
				return (<p className='centered'>{this.state.signedUp}</p>);
			}
		}

		return (
			<div className='page constrained'>
				<Panel />
				<div className='break' />
				<Button href='/' className='centered'>Return Home</Button>
				<div className='break' />
				<p className='centered'><em>(Remember to verify your email!)</em></p>
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

Signup = connect(mapStoreToProps, mapDispatchToProps)(Signup);

export default withRouter(Signup);