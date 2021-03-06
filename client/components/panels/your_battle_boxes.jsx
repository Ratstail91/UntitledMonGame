import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';
import { setCreatures } from '../../actions/profile';
import { setBattleBoxes } from '../../actions/battles';
import { setBattles } from '../../actions/battles';

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
				battleBox = {};
			}

			if (!battleBox.meta) {
				battleBox.meta = { locked: false };
			}

			if (!battleBox.content) {
				battleBox.content = [];
			}

			for (let i = 0; i < 6; i++) {
				battleBox.content[i] = battleBox.content[i] || { name: null, frontImage: null, boxSlot: i };
			}

			battleBox.content = battleBox.content.sort((a, b) => a.boxSlot - b.boxSlot);

			return battleBox;
		});

		return (
			<div className='panel'>
				{battleBoxArray.map( (battleBox, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className={`boxContainer panel${battleBox.meta.locked ? ' locked' : ''}`}>
								<div className='boxControls'>
									<Button onClick={() => this.sendBattleBoxRequest('/api/yourbattleboxes/lock/toggle', { box: idx })}>{battleBox.meta.locked ? '🔒' : '🔓'}</Button>
									<div className='gap mobile show' />
									<Button onClick={() => battleBox.meta.locked ? this.sendBattleBoxRequest('/api/yourbattles/invite', idx) : null} className={`${battleBox.meta.locked ? '' : 'disabled'}`}>🔗</Button>
									<div className='break mobile hide' />
								</div>

								{battleBox.content.map( (box, boxIdx) => {
									return (
										<div key={`${idx}-${boxIdx}`} className='boxPanel'>
											<img src={`/content/sprites/creatures/${box.frontImage ? box.frontImage : 'missing.png'}`} />

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
					if (json.battleBoxes) {
						this.props.setBattleBoxes(json.battleBoxes);
					}
					if (json.battles) {
						this.props.setBattles(json.battles);
					}
					if (json.creatures) {
						this.props.setCreatures(json.creatures);
					}
					if (json.inviteCode) {
						navigator.permissions.query({name: "clipboard-write"}).then(result => {
							if (result.state == "granted" || result.state == "prompt") {
								navigator.clipboard.writeText(`https://${process.env.NODE_ENV == 'development' ? 'localhost:3001' : 'eggtrainer.com'}/challenge?inviteCode=${json.inviteCode}`);
								alert('Link copied to clipboard!');
							} else {
								alert('Can\'t copy to clipboard!');
							}
						});
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
	setBattles: PropTypes.func.isRequired,
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
		setBattles: (battles) => dispatch(setBattles(battles)),
	};
};

YourBattleBoxes = connect(mapStoreToProps, mapDispatchToProps)(YourBattleBoxes);

export default YourBattleBoxes;
