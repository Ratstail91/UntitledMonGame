import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';

class ShopPremium extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			premiums: []
		};
	}

	componentDidMount() {
		this.sendShopPremiumRequest();
	}

	render() {
		if (this.state.premiums.length == 0) {
			return (
				<div>
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
								<span>${premium.value / 100} USD</span>

								<Button disabled onClick={e => { e.preventDefault(); e.persist(); e.target.setAttribute('disabled', 'disabled'); this.sendBuyPremiumRequest(idx, e); }}>Buy</Button>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendShopPremiumRequest() {
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

		xhr.open('GET', '/api/shoppremium', true);
		xhr.send();
	}

	sendBuyPremiumRequest(index, e) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					e.target.removeAttribute('disabled');
					const json = JSON.parse(xhr.responseText);
					this.props.setProfile(json.profile.username, json.profile.coins);
					alert('Premium Item Purchased!');
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/shoppremium/buy', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			index: index
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