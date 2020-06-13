import React from 'react';
import { connect } from 'react-redux';
import validateEmail from '../../../common/utilities/validate_email';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';

class PasswordRecover extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: ''
		};
	}

	render() {
		return (
			<div className='panel right'>
				<h1 className='centered'>Recover Password</h1>

				<form action='/api/passwordrecover' method='post' onSubmit={this.submit.bind(this)}>
					<div>
						<label htmlFor='email'>Email:</label>
						<input required id='email' type='email' name='email' value={this.state.email} onChange={this.updateEmail.bind(this)} />
					</div>

					<Button type='submit' disabled={!this.state.email}>Send Email</Button>
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
		if (!validateEmail(this.state.email)) {
			this.props.setWarning('Invalid Email');
			return false;
		}

		return true;
	}

	clearInput() {
		this.setState({ email: '' });
	}

	updateEmail(evt) {
		this.setState({ email: evt.target.value });
	}
};

PasswordRecover.propTypes = {
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

PasswordRecover = connect(mapStoreToProps, mapDispatchToProps)(PasswordRecover);

export default PasswordRecover;
