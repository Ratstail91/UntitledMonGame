import React from 'react';
import { connect } from 'react-redux';
import Button from '../button';

import { setWarning } from '../../actions/warning';

class AdminDisplay extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			snapshotRecords: []
		};
	}

	componentDidMount() {
		this.sendAdminRequest('/api/admin');
	}

	render() {
		return (
			<div className='panel' style={{flexDirection: 'row'}}>
				<div className='panel scrollable'>
					{this.state.snapshotRecords.map((record, idx) => {
						return (
							<div key={idx}><p>Accounts: {record.activeAccounts}/{record.totalAccounts} &gt; {record.activeProfiles}/{record.totalProfiles}</p></div>
						);
					})}
				</div>
				<Button onClick={e => this.sendAdminRequest('/api/admin/shop/reset')}>Reset Shop</Button>
			</div>
		);
	}

	sendAdminRequest(url) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					if (json.snapshotRecords) {
						this.setState({ snapshotRecords: json.snapshotRecords });
					}
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', url, true);
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

export default connect(mapStoreToProps, mapDispatchToProps)(AdminDisplay);
