import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

//panels
import YourProfilePanel from '../panels/your_profile.jsx';

class YourProfile extends React.Component {
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
				<YourProfilePanel />
			</div>
		);
	}
}

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

YourProfile = connect(mapStoreToProps, mapDispatchToProps)(YourProfile);

export default withRouter(YourProfile);