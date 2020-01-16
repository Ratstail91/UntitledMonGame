import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

//panels
import PrivacyPolicyPanel from '../panels/privacy_settings.jsx';
import DeleteAccountPanel from '../panels/delete_account.jsx';

class PrivacySettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			changed: ''
		}
	}

	componentDidMount() {
		if (!this.props.loggedIn) {
			this.props.history.push('/');
		}
	}

	render() {
		let Panel;

		if (!this.state.changed) {
			Panel = () => {
				return (<PrivacyPolicyPanel onSuccess={(msg) => this.setState({ changed: msg }) } />);
			}
		} else {
			Panel = () => {
				return (<p>{this.state.changed}</p>);
			}
		}

		return (
			<div className='page constrained'>
				<Panel />
				<Link to='/' className='centered'>Return Home</Link>
				<div className='break' style={{paddingBottom:'5em'}} />
				<DeleteAccountPanel />
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		loggedIn: store.account.id !== 0,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
};

PrivacySettings = connect(mapStoreToProps, mapDispatchToProps)(PrivacySettings);

export default withRouter(PrivacySettings);