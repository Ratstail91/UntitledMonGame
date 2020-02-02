import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';
import moment from 'moment';

import { setWarning } from '../../actions/warning.js';
import { setCreatures } from '../../actions/profile.js';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

class YourCreatures extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendYourCreaturesRequest('/api/yourcreatures');
	}

	render() {
		if (this.props.creatures.length == 0) {
			return (
				<p>Creatures go here.</p>
			);
		}

		return (
			<div className='panel' style={{flexDirection: 'row', flexWrap:'wrap'}}>
				{this.props.creatures.map( (creature, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/creatures/${creature.frontImage}`} />
								<span><strong>{creature.name} - {capitalize(creature.element)}</strong></span>
								<span style={{marginLeft: '1em', marginRight: '1em', textAlign: 'center'}}><em>{creature.description}</em></span>
								<div className='break' />

								<Dropdown>
									<Dropdown.Toggle>Actions</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.creatureAction(idx, 'inspect'); }}>Inspect</Dropdown.Item>
										<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.creatureAction(idx, 'train'); }}>Train</Dropdown.Item>
										<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.creatureAction(idx, 'breed'); }}>Breed</Dropdown.Item>
										<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.creatureAction(idx, 'release'); }}>Release</Dropdown.Item>
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

	sendYourCreaturesRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.props.setCreatures(json.creatures);
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

	creatureAction(index, action) {
		switch(action) {
			case 'inspect':
				//TODO: inspect
				return;

			case 'train':
				//TODO: train
				return;

			case 'breed':
				//TODO: breeding
				return;

			case 'release':
				//TODO: release
				return;
		}
	}
}

YourCreatures.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setCreatures: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		creatures: store.profile.creatures,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setProfile: (username, coins) => dispatch(setProfile(username, coins)),
		setCreatures: (creatures) => dispatch(setCreatures(creatures)),
	};
};

YourCreatures = connect(mapStoreToProps, mapDispatchToProps)(YourCreatures);

export default YourCreatures;