import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
import { setProfile } from '../../actions/profile.js';
import { setItems } from '../../actions/profile.js';

class YourItems extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendYourItemsRequest('/api/youritems');
	}

	render() {
		if (this.props.items.length == 0) {
			return (
				<p>Items go here.</p>
			);
		}

		return (
			<div className='panel' style={{flexDirection: 'row', flexWrap:'wrap'}}>
				{this.props.items.map( (item, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={item.premium ? `/content/sprites/premiums/${item.sprite}` : `/content/sprites/items/${item.sprite}`} />
								<span>{item.name}</span>
								<div className='break' />

								<Dropdown>
									<Dropdown.Toggle>Actions</Dropdown.Toggle>

									<Dropdown.Menu>
										{!item.premium ? <Dropdown.Item onClick={e => { e.preventDefault(); this.itemAction(idx, 'sell'); }}>Sell</Dropdown.Item> : <div />}
									</Dropdown.Menu>
								</Dropdown>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendYourItemsRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					if (json.profile) {
						this.props.setProfile(json.profile.username, json.profile.coins);
					}
					this.props.setItems(json.items);
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			index: index,
		}));
	}

	itemAction(index, action) {
		switch(action) {
			case 'sell':
				if (confirm('Sell this item?')) {
					this.sendYourItemsRequest('/api/youritems/sell', index);
				}
				return;
		}
	}
}

YourItems.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setItems: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		items: store.profile.items,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setProfile: (username, coins) => dispatch(setProfile(username, coins)),
		setItems: (items) => dispatch(setItems(items)),
	};
};

YourItems = connect(mapStoreToProps, mapDispatchToProps)(YourItems);

export default YourItems;