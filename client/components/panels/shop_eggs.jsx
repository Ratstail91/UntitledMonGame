import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

class ShopEggs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			eggs: []
		};
	}

	componentDidMount() {
		this.sendShopEggsRequest();
	}

	render() {
		if (this.state.eggs.length == 0) {
			return (
				<p>Eggs go here.</p>
			);
		}

		return (
			<div className='panel' style={{flexDirection: 'row', flexWrap:'wrap'}}>
				<div className='break' />
				{this.state.eggs.map( (egg, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/eggs/${egg.element}.png`} />
								<span>{capitalize(egg.element)} Egg</span>
								<span>{capitalize(egg.rarity)} - {egg.value} coins</span>

								<Button onClick={e => { e.preventDefault(); e.persist(); e.target.setAttribute('disabled', 'disabled'); this.sendBuyEggRequest(idx, e); }}>Buy</Button>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendShopEggsRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const eggs = JSON.parse(xhr.responseText);
					this.setState({
						eggs: eggs
					});
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('GET', '/api/shopeggs', true);
		xhr.send();
	}

	sendBuyEggRequest(index, e) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					e.target.removeAttribute('disabled');
					const json = JSON.parse(xhr.responseText);
					this.props.setProfile(json.username, json.coins);
					alert('Egg Purchased!');
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/shopeggs/buy', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			index: index
		}));
	}
}

ShopEggs.propTypes = {
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

ShopEggs = connect(mapStoreToProps, mapDispatchToProps)(ShopEggs);

export default ShopEggs;