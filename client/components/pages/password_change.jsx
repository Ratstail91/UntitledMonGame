import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

//panels
import PasswordChangePanel from '../panels/password_change.jsx';

class PasswordChange extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			changed: ''
		}
	}

	componentDidMount() {
		if (!this.props.loggedIn) {
			this.props.history.push('/');
		}
	}

	render() {
		let Panel;

		if (!this.state.changed) {
			Panel = () => {
				return (<PasswordChangePanel onSuccess={(msg) => this.setState({ changed: msg }) } />);
			}
		} else {
			Panel = () => {
				return (<p>{this.state.changed}</p>);
			}
		}

		return (
			<div className='page constrained'>
				<Panel />
				<Link to='/' className='centered'>Return Home</Link>
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

PasswordChange = connect(mapStoreToProps, mapDispatchToProps)(PasswordChange);

export default withRouter(PasswordChange);