import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';

//panels
import YourProfilePanel from '../panels/your_profile.jsx';

import YourEggs from '../panels/your_eggs.jsx';
import YourItems from '../panels/your_items.jsx';

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
				<h1 className='centered'>Profile</h1>
				<YourProfilePanel />
				<Tabs>
					<Tab eventKey='creatures' title='Creatures'>
						<p>Creatures go here.</p>
					</Tab>

					<Tab eventKey='eggs' title='Eggs'>
						<YourEggs />
					</Tab>

					<Tab eventKey='inventory' title='Inventory'>
						<YourItems />
					</Tab>

					<Tab eventKey='battles' title='Battles'>
						<p>Battles go here.</p>
					</Tab>
				</Tabs>
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