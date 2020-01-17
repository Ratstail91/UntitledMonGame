import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '../button.jsx';
import { setWarning } from '../../actions/warning.js';

class PrivacySettings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			promotions: false,
		};

		//TODO: change email
		//TODO: delete account
	}

	componentDidMount() {
		this.sendSettingsRequest();
	}

	render() {
		return (
			<div className='panel'>
				<h1 className='centered'>Privacy Settings</h1>

				<form onSubmit={this.submitForm.bind(this)}>
					<div className='checkboxContainer'>
						<label htmlFor='promotions'>Allow Promotional Emails:</label>
						<input id='promotions' type='checkbox' name='promotions' checked={this.state.promotions} onChange={ this.updatePromotions.bind(this) } className='checkbox' />
					</div>

					<Button type='submit'>Update</Button>
				</form>
			</div>
		);
	}

	submitForm(e) {
		e.preventDefault();

		let form = e.target;
		let formData = new FormData(form);

		formData.append('id', this.props.id);
		formData.append('token', this.props.token);

		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			this.onReadyStateChange(xhr);

			if (xhr.readyState === 4 && xhr.status === 200 && this.props.onSuccess) {
				this.props.onSuccess('Information updated');
			}
		}

		xhr.open('POST', '/privacysettingsupdaterequest', true);
		xhr.send(formData);
	}

	sendSettingsRequest() {
		//build the XHR
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => this.onReadyStateChange(xhr);

		xhr.open('POST', '/privacysettingsrequest', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
		}));
	}

	onReadyStateChange(xhr) {
		//SUPER DRY
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				//on success
				let json = JSON.parse(xhr.responseText);
				this.setState({
					promotions: json.promotions ? true : false
				});
			}

			else if (xhr.status === 400) {
				this.props.setWarning(xhr.responseText);
			}
		};
	}

	//updaters
	updatePromotions() {
		this.setState({ promotions: !this.state.promotions });
	}
}

PrivacySettings.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,

	onSuccess: PropTypes.func
};

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

PrivacySettings = connect(mapStoreToProps, mapDispatchToProps)(PrivacySettings);

export default PrivacySettings;