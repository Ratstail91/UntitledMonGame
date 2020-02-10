import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';
import { setCreatures } from '../../actions/profile.js';
import { setBattleBoxes } from '../../actions/battles.js';

class YourBattleBoxes extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendBattleBoxRequest('/api/yourbattleboxes');
	}

	render() {
		if (this.props.battleBoxes.length == 0) {
			return (
				<p>Battle boxes go here.</p>
			);
		}

		//preprocess the battleboxes
		let battleBoxArray = JSON.parse(JSON.stringify(this.props.battleBoxes || []));

		battleBoxArray = battleBoxArray.map( (battleBox, idx) => {
			if (!battleBox) {
				battleBox = [];
			}

			for (let i = 0; i < 6; i++) {
				battleBox[i] = battleBox[i] || { name: null, frontImage: null, boxSlot: i };
			}

			battleBox = battleBox.sort((a, b) => a.boxSlot - b.boxSlot);

			return battleBox;
		});

		return (
			<div className='panel'>
				{battleBoxArray.map( (battleBox, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggContainer panel'>
								{battleBox.map( (box, boxIdx) => {
									return (
										<div key={`${idx}-${boxIdx}`} className='eggPanel'>
											<img src={`/content/sprites/creatures/${box.frontImage ? box.frontImage : 'missing.png'}`} style={{width: '150px', height: '150px'}} />

											<span><strong>{box.name}</strong></span>

											<div>
												<Button onClick={e => this.sendBattleBoxRequest('/api/yourbattleboxes/shift', { box: idx, slot: boxIdx, direction: -1 })}>{'<'}</Button>
												<Button onClick={e => this.sendBattleBoxRequest('/api/yourbattleboxes/remove', { box: idx, slot: boxIdx})}>{'X'}</Button>
												<Button onClick={e => this.sendBattleBoxRequest('/api/yourbattleboxes/shift', { box: idx, slot: boxIdx, direction: 1 })}>{'>'}</Button>
											</div>
										</div>
									);
								})}
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendBattleBoxRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.props.setBattleBoxes(json.battleBoxes);
					if (json.creatures) {
						this.props.setCreatures(json.creatures);
					}
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
};

YourBattleBoxes.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	battleBoxes: PropTypes.array.isRequired,
	setWarning: PropTypes.func.isRequired,
	setCreatures: PropTypes.func.isRequired,
	setBattleBoxes: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		battleBoxes: store.battles.battleBoxes,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setCreatures: (creatures) => dispatch(setCreatures(creatures)),
		setBattleBoxes: (battleBoxes) => dispatch(setBattleBoxes(battleBoxes)),
	};
};

YourBattleBoxes = connect(mapStoreToProps, mapDispatchToProps)(YourBattleBoxes);

export default YourBattleBoxes;