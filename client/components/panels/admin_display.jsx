import React from 'react';
import { connect } from 'react-redux';

import { setWarning } from '../../actions/warning.js';

class AdminDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.sendAdminRequest();
	}

	render() {

		console.log(this.state);
		return (
			<div className='panel' style={{overflowY: 'scroll', maxWidth: '200px', maxHeight: '50vh'}}>
				{Object.values(this.state).map((record, idx) => {
					return (
						<div key={idx}><p>Accounts: {record.activeAccounts}/{record.totalAccounts} -> {record.activeProfiles}/{record.totalProfiles}</p></div>
					);
				})}
			</div>
		);
	}

	sendAdminRequest(total) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					this.setState(JSON.parse(xhr.responseText));
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/admin', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
		}));
	}
}

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	};
};

AdminDisplay = connect(mapStoreToProps, mapDispatchToProps)(AdminDisplay);

export default AdminDisplay;
