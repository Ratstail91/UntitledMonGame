import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { logout } from '../../actions/account.js';
import { setWarning } from '../../actions/warning.js';

class DeleteAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			display: false
		};
	}

	render() {
		if (this.state.display) {
			const borderStyle = {
				borderStyle: 'solid',
				borderWidth: '1px',
				borderRadius: '3px',
				flex: '1',
				display: 'flex',
				flexDirection: 'column'
			};

			return (
				<div>
					<div style={borderStyle}>
						<p><strong>WARNING: </strong>If you press the button below, your account, and everything you have, will be deleted in 48 hours unless you log back in.</p>
						<Button className='btn btn-danger' onClick={e => {this.submit(e); this.logout();}}>Delete Account - Yes I'm Sure</Button>
					</div>
				</div>
			);
		}

		return (
			<Button className='btn btn-danger' onClick={() => this.setState({ display: true })}>Delete Account</Button>
		);
	}

	submit(e) {
		e.preventDefault();
		this.sendRequest('/accountdeleterequest');
	}

	logout() {
		this.sendRequest('/logoutrequest');
		this.props.logout();
		this.props.history.push('/');
	}

	sendRequest(url) {
		//build the XHR
		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//
				}

				else if (xhr.status === 400) {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		//send the XHR
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token
		}));
	}
}

DeleteAccount.propTypes = {
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
		setWarning: (msg) => { dispatch(setWarning(msg)) },
		logout: () => { dispatch(logout()) }
	}
};

DeleteAccount = connect(mapStoreToProps, mapDispatchToProps)(DeleteAccount);

export default withRouter(DeleteAccount);