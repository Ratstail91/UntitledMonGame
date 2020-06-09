import React from 'react';
import { connect } from 'react-redux';
import { sessionChange } from '../../actions/account';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';

class PasswordReset extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			password: '',
			retype: '',
		};
	}

	render() {
		return (
			<div className='panel right'>
				<h1 className='centered'>New Password</h1>

				<form action='/api/passwordreset' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='password'>Password:</label>
						<input required id='password' type='password' name='password' value={this.state.password} onChange={this.updatePassword.bind(this)} />
					</div>

					<div>
						<label htmlFor='retype'>Retype Password:</label>
						<input required id='retype' type='password' name='retype' value={this.state.retype} onChange={this.updateRetype.bind(this)} />
					</div>

					<Button type='submit'>New Password</Button>
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
		if (this.state.password.length < 8) {
			this.props.setWarning('Minimum password length is 8 characters');
			return false;
		}

		if (this.state.password !== this.state.retype) {
			this.props.setWarning('Passwords do not match');
			return false;
		}

		return true;
	}

	clearInput() {
		this.setState({ password: '', retype: '' });
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

const mapStoreToProps = (store) => {
	return {
		//
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	};
};

PasswordReset = connect(mapStoreToProps, mapDispatchToProps)(PasswordReset);

export default PasswordReset;