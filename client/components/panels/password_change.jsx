import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';

class PasswordChange extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			oldPassword: '',
			newPassword: '',
			retype: ''
		};
	}

	render() {
		return (
			<div className='panel right'>
				<h1 className='centered'>Change Password</h1>

				<form action='/api/passwordchange' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='oldpassword'>Old Password:</label>
						<input required id='oldpassword' type='password' name='oldpassword' value={this.state.oldPassword} onChange={this.updateOldPassword.bind(this)} />
					</div>

					<div>
						<label htmlFor='newpassword'>New Password:</label>
						<input required id='newpassword' type='password' name='newpassword' value={this.state.newPassword} onChange={this.updateNewPassword.bind(this)} />
					</div>

					<div>
						<label htmlFor='retype'>Retype New Password:</label>
						<input required id='retype' type='password' name='retype' value={this.state.retype} onChange={this.updateRetype.bind(this)} />
					</div>

					<Button type='submit'>Change Password</Button>
				</form>
			</div>
		);
	}

	submit(e) {
		e.preventDefault();

		if (!this.validateInput()) {
			return;
		}

		//build the XHR (around an existing form object)
		let form = e.target;
		let formData = new FormData(form);

		formData.append('id', this.props.id);
		formData.append('token', this.props.token);

		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let json = JSON.parse(xhr.responseText);

					//on success
					if (this.props.onSuccess) {
						this.props.onSuccess(json.msg);
					}
				}

				else if (xhr.status === 400) {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		//send the XHR
		xhr.open('POST', form.action, true);
		xhr.send(formData);

		this.clearInput();
	}

	validateInput(e) {
		if (this.state.newPassword.length < 8) {
			this.props.setWarning('Minimum password length is 8 characters');
			return false;
		}

		if (this.state.newPassword !== this.state.retype) {
			this.props.setWarning('Passwords do not match');
			return false;
		}

		return true;
	}

	clearInput() {
		this.setState({ oldPassword: '', newPassword: '', retype: '' });
	}

	updateOldPassword(evt) {
		this.setState({ oldPassword: evt.target.value });
	}

	updateNewPassword(evt) {
		this.setState({ newPassword: evt.target.value });
	}

	updateRetype(evt) {
		this.setState({ retype: evt.target.value });
	}
};

PasswordChange.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,

	onSuccess: PropTypes.func
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	};
};

PasswordChange = connect(mapStoreToProps, mapDispatchToProps)(PasswordChange);

export default PasswordChange;
