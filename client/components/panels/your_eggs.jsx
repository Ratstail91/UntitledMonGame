import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
import { setEggs } from '../../actions/profile.js';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

class YourEggs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendYourEggsRequest('/api/youreggs');
	}

	render() {
		if (this.props.eggs.length == 0) {
			return (
				<p>Eggs go here.</p>
			);
		}

		return (
			<div className='panel' style={{flexDirection: 'row', flexWrap:'wrap'}}>
				{this.props.eggs.map( (egg, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/eggs/${egg.element}.png`} />
								<span>{capitalize(egg.element)} Egg</span>

								<Dropdown>
									<Dropdown.Toggle>Actions</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.eggAction(idx, 'incubate'); }}>Incubate</Dropdown.Item>
										<Dropdown.Item onClick={e => { e.preventDefault(); this.eggAction(idx, 'sell'); }}>Sell</Dropdown.Item>
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

	sendYourEggsRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const eggs = JSON.parse(xhr.responseText);
					this.props.setEggs(eggs);
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

	sendSpeciesRequest(speciesName) {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					this.setState({
						species: {
							...this.state.species,
							...JSON.parse(xhr.responseText)
						}
					});
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		}

		xhr.open('GET', `/api/creature?species=${speciesName}`, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send();
	}

	eggAction(index, action) {
		switch(action) {
			case 'incubate':
				return;

			case 'sell':
				if (confirm('Sell this egg?')) {
					this.sendYourEggsRequest('/api/youreggs/sell', index);
				}
				return;
		}
	}
}

YourEggs.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setEggs: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		eggs: store.profile.eggs,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setEggs: (eggs) => dispatch(setEggs(eggs))
	};
};

YourEggs = connect(mapStoreToProps, mapDispatchToProps)(YourEggs);

export default YourEggs;