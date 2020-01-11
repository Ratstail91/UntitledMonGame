import React from 'react';
import { validateEmail } from '../../../common/utilities.js'; //TODO: move utilities to a better position
import PropTypes from 'prop-types';

class PasswordRecover extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			warning: ''
		};
	}

	render() {
		let warningStyle = {
			display: this.state.warning.length > 0 ? 'flex' : 'none'
		};

		return (
			<div className='panel right'>
				<h1>Recover Password</h1>

				<div className='warning' style={warningStyle}>
					<p>{this.state.warning}</p>
				</div>

				<form action='/passwordrecoverrequest' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='email'>Email:</label>
						<input id='email' type='text' name='email' value={this.state.email} onChange={this.updateEmail.bind(this)} />
					</div>

					<button type='submit' disabled={!this.state.email}>Send Email</button>
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

		this.clearInput();
	}

	validateInput(e) {
		if (!validateEmail(this.state.email)) {
			this.setWarning('Invalid Email');
			return false;
		}

		return true;
	}

	setWarning(s) {
		this.setState({ warning: s });
	}

	clearInput() {
		this.setState({ email: '', warning: '' });
	}

	updateEmail(evt) {
		this.setState({ email: evt.target.value });
	}
};

PasswordRecover.propTypes = {
	onSuccess: PropTypes.func
};

export default PasswordRecover;