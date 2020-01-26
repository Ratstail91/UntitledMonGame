import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';

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

								<Button disabled onClick={e => { e.preventDefault(); this.sendBuyEggRequest(idx); }}>Buy</Button>
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
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send();
	}

	sendBuyEggRequest(index) {
		//TODO: sendBuyEggRequest
	}
}

ShopEggs.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
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
	};
};

ShopEggs = connect(mapStoreToProps, mapDispatchToProps)(ShopEggs);

export default ShopEggs;