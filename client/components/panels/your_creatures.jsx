import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
import { setCreatures } from '../../actions/profile.js';
import { setInspect } from '../../actions/inspect.js';

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
			<div className='eggContainer panel'>
				{this.props.creatures.map( (creature, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={`/content/sprites/creatures/${creature.frontImage}`} />

								<span><strong>{creature.name} - {capitalize(creature.element)}</strong></span>
								<span style={{marginLeft: '1em', marginRight: '1em', textAlign: 'center'}}><em>{creature.description}</em></span>
								<div className='break' />

								<div className='panel' style={{flexDirection: 'row', alignItems: 'center'}}>
									<Dropdown>
										<Dropdown.Toggle>Actions</Dropdown.Toggle>

										<Dropdown.Menu>
											<Dropdown.Item onClick={e => { e.preventDefault(); this.creatureAction(idx, 'inspect'); }}>Inspect</Dropdown.Item>
											<Dropdown.Item disabled onClick={e => { e.preventDefault(); this.creatureAction(idx, 'train'); }}>Train</Dropdown.Item>
											<Dropdown.Item onClick={e => { e.preventDefault(); this.creatureAction(idx, 'moves'); }}>Select Moves</Dropdown.Item>
											<Dropdown.Item onClick={e => { e.preventDefault(); this.creatureAction(idx, creature.breeding ? 'unbreed' : 'breed'); }}>{creature.breeding ? 'Cancel Breeding' : 'Breed'}</Dropdown.Item>
											<Dropdown.Item onClick={e => { e.preventDefault(); this.creatureAction(idx, 'release'); }}>Release</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>

									<div className='gap' />

									<img src='/content/sprites/heart.png' style={{maxWidth: '25px', maxHeight: '25px', display: creature.breeding ? 'initial' : 'none'}} />
								</div>
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
				this.props.setInspect(index);
				this.props.history.push('/inspect');
				return;

			case 'train':
				//TODO: train
				return;

			case 'moves':
				this.props.setInspect(index);
				this.props.history.push('/movesselect');
				return;

			case 'breed':
				this.sendYourCreaturesRequest('/api/yourcreatures/breed', index);
				return;

			case 'unbreed':
				this.sendYourCreaturesRequest('/api/yourcreatures/unbreed', index);
				return;

			case 'release':
				if (confirm('Are you sure you want to release this creature?') && confirm('Are you absolutely sure? (They\'ll be gone forever!)')) {
					this.sendYourCreaturesRequest('/api/yourcreatures/release', index);
				}
				return;
		}
	}
}

YourCreatures.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setCreatures: PropTypes.func.isRequired,
	setInspect: PropTypes.func.isRequired,
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
		setInspect: (index) => dispatch(setInspect(index)),
	};
};

YourCreatures = connect(mapStoreToProps, mapDispatchToProps)(YourCreatures);

export default withRouter(YourCreatures);