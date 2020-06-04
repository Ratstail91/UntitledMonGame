import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';

//TODO: this needs a better name
class YourProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendProfileRequest();
	}

	render() {
		return (
			<div className='panel'>
				<p>Username: {this.props.username}</p>
				<p>Coins: {this.props.coins}</p>
			</div>
		);
	}

	sendProfileRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.props.setProfile(json.profile.username, json.profile.coins);
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/yourprofile', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token
		}));
	}
}

YourProfile.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setProfile: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		username: store.profile.username,
		coins: store.profile.coins,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setProfile: (username, coins) => dispatch(setProfile(username, coins))
	};
};

YourProfile = connect(mapStoreToProps, mapDispatchToProps)(YourProfile);

export default YourProfile;