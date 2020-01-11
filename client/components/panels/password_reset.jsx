import React from 'react';
import { connect } from 'react-redux';
import { sessionChange } from '../../actions/account.js';
import PropTypes from 'prop-types';

class PasswordReset extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			password: '',
			retype: '',
			warning: ''
		};
	}

	render() {
		let warningStyle = {
			display: this.state.warning.length > 0 ? 'flex' : 'none'
		};

		return (
			<div className='panel right'>
				<h1>Change Password</h1>

				<div className='warning' style={warningStyle}>
					<p>{this.state.warning}</p>
				</div>

				<form action='/passwordresetrequest' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='password'>Password:</label>
						<input id='password' type='password' name='password' value={this.state.password} onChange={this.updatePassword.bind(this)} />
					</div>

					<div>
						<label htmlFor='retype'>Retype Password:</label>
						<input id='retype' type='password' name='retype' value={this.state.retype} onChange={this.updateRetype.bind(this)} />
					</div>

					<button type='submit'>Change Password</button>
				</form>
			</div>
		);
	}

	submit(e) {
		e.preventDefault();

		if (!this.validateInput()) {
			return;
		}

		//build the XHR
		let form = e.target;
		let formData = new FormData(form);

		formData.append('email', this.props.email);
		formData.append('token', this.props.token);

		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let json = JSON.parse(xhr.responseText);

					if (this.props.onSuccess) {
						this.props.onSuccess(json.msg);
					}
				}

				else if (xhr.status === 400) {
					this.setWarning(xhr.responseText);
				}
			}
		};

		//send the XHR
		xhr.open('POST', form.action, true);
		xhr.send(formData);
	}

	validateInput(e) {
		if (this.state.password.length < 8) {
			this.setWarning('Minimum password length is 8 characters');
			return false;
		}

		if (this.state.password !== this.state.retype) {
			this.setWarning('Passwords do not match');
			return false;
		}

		return true;
	}

	setWarning(s) {
		this.setState({ warning: s });
	}

	clearInput() {
		this.setState({ password: '', retype: '', warning: '' });
	}

	updatePassword(evt) {
		this.setState({ password: evt.target.value });
	}

	updateRetype(evt) {
		this.setState({ retype: evt.target.value });
	}
};

PasswordReset.propTypes = {
	email: PropTypes.string.isRequired,
	token: PropTypes.number.isRequired,

	onSuccess: PropTypes.func
};

export default PasswordReset;