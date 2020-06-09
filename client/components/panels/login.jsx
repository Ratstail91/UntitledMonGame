import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';
import { login } from '../../actions/account';
import { validateEmail } from '../../utilities/validate_email';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: ''
		};
	}

	render() {
		return (
			<div className='panel right'>
				<h1 className='centered'>Login</h1>

				<form action='/api/login' method='post' onSubmit={ this.submit.bind(this) } >
					<div>
						<label htmlFor='email'>Email:</label>
						<input required id='email' type='email' name='email' value={this.state.email} onChange={ this.updateEmail.bind(this) } />
					</div>

					<div>
						<label htmlFor='password'>Password:</label>
						<input required id='password' type='password' name='password' value={this.state.password} onChange={ this.updatePassword.bind(this) } />
					</div>

					<Button type='submit' disabled={!this.state.email}>Login</Button>
				</form>
			</div>
		);
	}

	submit(e) {
		e.preventDefault();

		//build and validate the form data
		let form = e.target;
		let formData = new FormData(form);

		//BUGFIX: trim the input data
		const email = formData.get('email');
		formData.delete('email');
		formData.append('email', email.trim());

		if (!this.validateInput(formData.get('email'), formData.get('password'))) {
			return;
		}

		//build the xhr
		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let json = JSON.parse(xhr.responseText);

					this.props.login(
						json.id,
						json.token
					);

					if (this.props.onSuccess) {
						this.props.onSuccess(json.msg); //NOTE: could use this as a redirect to a special offer or sonmething
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

	validateInput(email, password) {
		if (!validateEmail(email)) {
			this.props.setWarning('Invalid Email');
			return false;
		}

		if (password.length < 8) {
			this.props.setWarning('Minimum password length is 8 characters');
			return false;
		}

		return true;
	}

	clearInput() {
		this.setState({ email: '', password: '', warning: '' });
	}

	updateEmail(evt) {
		this.setState({ email: evt.target.value });
	}

	updatePassword(evt) {
		this.setState({ password: evt.target.value });
	}
};

Login.propTypes = {
	login: PropTypes.func.isRequired,

	onSubmit: PropTypes.func
};

const mapStoreToProps = (store) => {
	return {
		//
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		login: (id, token) => dispatch(login(id, token)),
		setWarning: msg => dispatch(setWarning(msg))
	}
};

Login = connect(mapStoreToProps, mapDispatchToProps)(Login);

export default Login;