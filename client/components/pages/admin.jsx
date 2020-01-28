import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

//panels
import AdminDisplay from '../panels/admin_display.jsx';

class Admin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (!this.props.loggedIn) {
			this.props.history.push('/');
		}
	}

	render() {
		return (
			<div className='page'>
				<AdminDisplay />
			</div>
		);
	}
};

const mapStoreToProps = (store) => {
	return {
		loggedIn: !!store.account.id
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
};

Admin = connect(mapStoreToProps, mapDispatchToProps)(Admin);

export default withRouter(Admin);