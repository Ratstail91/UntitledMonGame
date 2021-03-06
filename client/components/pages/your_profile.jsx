import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';

//panels
import YourProfilePanel from '../panels/your_profile';

import YourCreatures from '../panels/your_creatures';
import YourEggs from '../panels/your_eggs';
import YourItems from '../panels/your_items';
import YourBattleBoxes from '../panels/your_battle_boxes';
import YourBattles from	 '../panels/your_battles';

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
						<YourCreatures />
					</Tab>

					<Tab eventKey='eggs' title='Eggs'>
						<YourEggs />
					</Tab>

					<Tab eventKey='inventory' title='Inventory'>
						<YourItems />
					</Tab>

					<Tab eventKey='battleBoxes' title='Battle Boxes'>
						<YourBattleBoxes />
					</Tab>

					<Tab eventKey='battles' title='Battles'>
						<YourBattles />
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
