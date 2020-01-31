import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import paypal from 'paypal-checkout';
import client from 'braintree-web/client';
import paypalCheckout from 'braintree-web/paypal-checkout';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';

class ShopPremium extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			premiums: [],
			clientToken: null
		};
	}

	componentDidMount() {
		this.sendShopPremiumsRequest();
		this.sendShopPremiumsClientTokenRequest();
	}

	componentDidUpdate() {
		if (!this.state.clientToken) {
			return;
		}

		this.state.premiums.forEach((premium, idx) => {
			//hook the element to paypal
			paypal.Button.render({
				braintree: {
					client: client,
					paypalCheckout: paypalCheckout,
				},
				client: {
					production: this.state.clientToken
				},
				env: 'production',

				payment: (data, actions) => {
					return actions.braintree.create({
						flow: 'checkout',
						amount: premium.value / 100,
						currency: 'AUD',
						enableShippingAddress: false,
					});
				},

				onAuthorize: (payload) => {
					//submit payload.nonce to the server
					this.sendShopPremiumsNonceMessage(payload.nonce, idx);
				}
			}, `#btn-${idx}`);
		});
	}

	render() {
		if (this.state.premiums.length == 0) {
			return (
				<div className='panel'>
					<p>Premium goods go here.</p>
					<p>You'll be able to support the game's development here, and get a bonus as well!</p>
				</div>
			);
		}

		return (
			<div className='panel' style={{flexDirection: 'row', flexWrap:'wrap'}}>
				<div className='break' />
				{this.state.premiums.map( (premium, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/premiums/${premium.sprite}`} />
								<span>{premium.name}</span>
								<span>${premium.value / 100} AUD</span>

								<button id={`btn-${idx}`}>Buy</button>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendShopPremiumsRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.setState({ premiums: json.premiums });
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('GET', '/api/shoppremiums', true);
		xhr.send();
	}

	sendShopPremiumsClientTokenRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.setState({ clientToken: json.clientToken });
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('GET', '/api/shoppremiums/client_token', true);
		xhr.send();
	}

	sendShopPremiumsNonceMessage(nonce, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					alert(json.msg);
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/shoppremiums/checkout', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			nonce: nonce,
			index: index,
		}));
	}
}

ShopPremium.propTypes = {
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

ShopPremium = connect(mapStoreToProps, mapDispatchToProps)(ShopPremium);

export default ShopPremium;