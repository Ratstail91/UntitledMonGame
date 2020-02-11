import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';

class ShopItems extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			items: []
		};
	}

	componentDidMount() {
		this.sendShopItemsRequest();
	}

	render() {
		if (this.state.items.length == 0) {
			return (
				<p>Items go here.</p>
			);
		}

		return (
			<div className='eggContainer panel'>
				<div className='break' />
				{this.state.items.map( (item, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/items/${item.sprite}`} />
								<span><strong>{item.name}</strong></span>
								<span style={{marginLeft: '1em', marginRight: '1em', textAlign: 'center'}}><em>{item.description}</em></span>
								<span>{item.value} coins</span>
								<div className='break' />

								<Button onClick={e => { e.preventDefault(); e.persist(); e.target.setAttribute('disabled', 'disabled'); this.sendBuyItemRequest(idx, e); }}>Buy</Button>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendShopItemsRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.setState({ items: json.items });
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('GET', '/api/shopitems', true);
		xhr.send();
	}

	sendBuyItemRequest(index, e) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					e.target.removeAttribute('disabled');
					const json = JSON.parse(xhr.responseText);
					this.props.setProfile(json.profile.username, json.profile.coins);
					alert('Item Purchased!');
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/shopitems/buy', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			index: index
		}));
	}
}

ShopItems.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setProfile: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setProfile: (username, coins) => dispatch(setProfile(username, coins)),
	};
};

ShopItems = connect(mapStoreToProps, mapDispatchToProps)(ShopItems);

export default ShopItems;