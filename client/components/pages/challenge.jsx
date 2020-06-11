import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import Button from '../button';

//panels
import LoginPanel from '../panels/login';
import SignupPanel from '../panels/signup';
import AcceptPanel from '../panels/accept';

class Challenge extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			display: props.loggedIn ? 'accept' : 'login',
			signedUp: '', //the signup message from the server
			done: false,
			search: queryString.parse(this.props.location.search),
		};
	}

	componentDidMount() {
		if (!this.state.search.inviteCode) {
			this.props.history.push('/');
		}
	}

	componentDidUpdate() {
		if (this.state.done) {
			this.props.history.push('/yourprofile');
		}
	}

	render() {
		switch(this.state.display) {
			case 'signup': {
				let Panel;

				if (!this.state.signedUp) {
					Panel = () => {
						return (<SignupPanel onSuccess={msg => this.setState({signedUp: msg})} code={this.state.search.code} referral={this.state.search.referral} />);
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
						<Button onClick={() => this.setState({ display: 'login' })} className='centered'>Login</Button>
						<div className='break' />
						<p className='centered'><em>(Remember to verify your email, then reload this page!)</em></p>
					</div>
				);
			}

			case 'login': {
				return (
					<div className='page constrained'>
						<LoginPanel onSuccess={msg => this.setState({ display: 'accept' })} />
						<div className='break' />
						<Button onClick={() => this.setState({ display: 'signup' })} className='centered'>Signup</Button>
					</div>
				);
			}

			case 'accept': {
				return (
					<div className='page constrained'>
						<AcceptPanel inviteCode={this.state.search.inviteCode} onSuccess={msg => this.setState({ done: true })} />
					</div>
				);
			}

			default:
				throw 'Unknown display state on the challenge screen';
		}
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

Challenge = connect(mapStoreToProps, mapDispatchToProps)(Challenge);

export default withRouter(Challenge);
