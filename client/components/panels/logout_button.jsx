import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button';

import { logout } from '../../actions/account';

class LogoutButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Button onClick={e => {e.preventDefault(); this.sendRequest('/api/logout')}}>Logout</Button>
		);
	}

	sendRequest(url) { //send a unified request, using my credentials
		//build the XHR
		let xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);

		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token
		}));

		//Don't wait for a response
		this.props.logout();

		if (this.props.onClick) {
			this.props.onClick();
		}
	}
};

LogoutButton.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	logout: PropTypes.func.isRequired,

	onClick: PropTypes.func
};

function mapStoreToProps(store) {
	return {
		id: store.account.id,
		token: store.account.token
	}
};

function mapDispatchToProps(dispatch) {
	return {
		logout: () => { dispatch(logout()) }
	}
};

LogoutButton = connect(mapStoreToProps, mapDispatchToProps)(LogoutButton);

export default LogoutButton;