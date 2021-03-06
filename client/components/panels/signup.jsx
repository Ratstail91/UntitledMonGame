import React from 'react';
import Button from '../button';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning';
import validateEmail from '../../../common/utilities/validate_email';

class Signup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			username: '',
			password: '',
			retype: '',
			code: props.code || '',
			promotions: true,
		};
	}

	render() {
		return (
			<div className='panel right'>
				<h1 className='centered'>Sign Up</h1>

				<form action='/api/signup' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='email'>Email:</label>
						<input required id='email' type='email' name='email' value={this.state.email} onChange={this.updateEmail.bind(this)} />
					</div>

					<div>
						<label htmlFor='username'>User Name:</label>
						<input required id='username' type='text' name='username' value={this.state.username} onChange={this.updateUsername.bind(this)} />
					</div>

					<div>
						<label htmlFor='password'>Password:</label>
						<input required id='password' type='password' name='password' value={this.state.password} onChange={this.updatePassword.bind(this)} />
					</div>

					<div>
						<label htmlFor='retype'>Retype Password:</label>
						<input required id='retype' type='password' name='retype' value={this.state.retype} onChange={this.updateRetype.bind(this)} />
					</div>

					<div>
						<label htmlFor='code'>Bonus Code (Optional):</label>
						<input id='code' type='text' name='code' value={this.state.code} onChange={this.updateCode.bind(this)} />
					</div>

					<div className='checkboxContainer'>
						<label htmlFor='promotions' style={{paddingLeft: '20px'}}>Allow Promo Emails:</label>
						<input id='promotions' type='checkbox' name='promotions' value={this.state.promotions} defaultChecked={true} onChange={this.updatePromotions.bind(this)} className='checkbox' />
					</div>

					<Button type='submit' disabled={!this.state.email  || !this.state.username || !this.state.password || !this.state.retype}>Sign Up</Button>
				</form>
			</div>
		);
	}

	submit(e) {
		e.preventDefault();

		//build and validate the formData
		let form = e.target;
		let formData = new FormData(form);

		//BUGFIX: trim the input data
		const email = formData.get('email');
		formData.delete('email');
		formData.append('email', email.trim());

		const username = formData.get('username');
		formData.delete('username');
		formData.append('username', username.trim());

		const code = formData.get('code');
		formData.delete('code');
		formData.append('code', code.trim());

		if (!this.validateInput(formData.get('email'), formData.get('username'), formData.get('password'), formData.get('retype'))) {
			return;
		}

		if (this.props.referral) {
			formData.append('referral', this.props.referral);
		}

		//build the XHR
		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let json = JSON.parse(xhr.responseText);

					//callback
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

	validateInput(email, username, password, retype) {
		if (!validateEmail(email)) {
			this.props.setWarning('Invalid Email');
			return false;
		}
		if (username.length < 4) {
			this.props.setWarning('Minimum username length is 4 characters');
			return false;
		}
		if (username.length > 100) {
			this.props.setWarning('Maximum username length is 100 characters');
			return false;
		}
		if (password.length < 8) {
			this.props.setWarning('Minimum password length is 8 characters');
			return false;
		}
		if (password !== retype) {
			this.props.setWarning('Passwords do not match');
			return false;
		}

		return true;
	}

	//text controllers
	clearInput() {
		this.setState({ email: '', username: '', password: '', retype: '', promotions: false, code: '' });
	}

	updateEmail(evt) {
		this.setState({ email: evt.target.value });
	}

	updateUsername(evt) {
		this.setState({ username: evt.target.value });
	}

	updatePassword(evt) {
		this.setState({ password: evt.target.value });
	}

	updateRetype(evt) {
		this.setState({ retype: evt.target.value });
	}

	updateCode(evt) {
		this.setState({ code: evt.target.value });
	}

	updatePromotions(evt) {
		this.setState({ promotions: evt.target.value });
	}
};

Signup.propTypes = {
	onSuccess: PropTypes.func
};

const mapStoreToProps = store => {
	return {
		//
	}
};

const mapDispatchToProps = dispatch => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	}
};

Signup = connect(mapStoreToProps, mapDispatchToProps)(Signup);

export default Signup;
