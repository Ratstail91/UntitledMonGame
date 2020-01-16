import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { logout } from '../../actions/account.js';

class DeleteAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Button className='btn btn-danger' disabled>Delete Account</Button>
		);
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
		logout: () => { dispatch(logout()) }
	}
};

DeleteAccount = connect(mapStoreToProps, mapDispatchToProps)(DeleteAccount);

export default DeleteAccount;