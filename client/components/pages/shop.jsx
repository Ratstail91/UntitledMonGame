import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';

//panels
import YourProfilePanel from '../panels/your_profile.jsx';

import ShopEggs from '../panels/shop_eggs.jsx';
import ShopItems from '../panels/shop_items.jsx';
import ShopPremium from '../panels/shop_premium.jsx';

class Shop extends React.Component {
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
				<h1 className='centered'>Shop</h1>
				<YourProfilePanel />
				<Tabs>
					<Tab eventKey='eggs' title='Eggs'>
						<ShopEggs />
					</Tab>

					<Tab eventKey='items' title='Items'>
						<ShopItems />
					</Tab>

					<Tab eventKey='premium' title='Premium'>
						<ShopPremium />
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

Shop = connect(mapStoreToProps, mapDispatchToProps)(Shop);

export default withRouter(Shop);