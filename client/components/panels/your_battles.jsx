import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import Button from '../button';

import { setWarning } from '../../actions/warning';
import { setBattles, setCreature } from '../../actions/battles';

class YourBattles extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendYourBattlesRequest('/api/yourbattles');
	}

	render() {
		if (this.props.battles.length == 0) {
			return (
				<p>Battles go here.</p>
			);
		}

		const YourMovePanel = props => {
			if (!props.move) {
				return (
					<div className='col' style={{flex: '0 1 auto', maxWidth: '150px'}}>
						<Button className='centered' style={{width: '150px', background:'red', borderColor: 'pink'}}>&lt;No Move&gt;</Button>
					</div>
				);
			}

			return (
				<div className='col' style={{flex: '0 1 auto', maxWidth: '150px'}}>
					<Dropdown>
						<Dropdown.Toggle className='centered' style={{width: '150px', background: props.move.exhausted ? 'pink' : 'lightblue'}}>{props.move.name}</Dropdown.Toggle>

						<Dropdown.Menu>
							<Dropdown.Item className={props.topAttackable ? '' : 'disabled'}>Attack Top</Dropdown.Item>
							<Dropdown.Item className={props.bottomAttackable ? '' : 'disabled'}>Attack Bottom</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			);
		};

		const YourCreaturePanel = props => {
			if (!props.creature) {
				return (
					<div className='battlePartialPanel' style={{flexDirection: 'column', justifyContent: 'center'}}>
						<Dropdown>
							<Dropdown.Toggle>Send Out</Dropdown.Toggle>

							<Dropdown.Menu>
								{props.team.map((creature, index) => {
									return (
										<Dropdown.Item key={`team-${index}`} eventKey={index}>{creature.name} {creature.currentHP}/{creature.maxHP}</Dropdown.Item>
									);
								})}
							</Dropdown.Menu>
						</Dropdown>
					</div>
				);
			}

			return (
				<div className='battlePartialPanel'>
					<div className='break mobile show' />

					<Button>↩️</Button>
					<div className='panel'>
						<img style={{flex: '0 1 auto'}} src={`/content/sprites/creatures/${props.creature.frontImage}`} />
						<span className='centered'><strong>{props.creature.name}</strong></span>
					</div>

					<div className='panel' style={{ maxWidth: '300px', flex: '1'}}>
						<span className='centered'><strong>HP</strong></span>
						<span className='centered'><strong>{props.creature.currentHP}/{props.creature.maxHP}</strong></span>

						<div className='break' />

						<div className='table noCollapse' style={{ maxWidth: '300px', flex: '0 1 auto'}}>
							<div className='row'>
								<YourMovePanel move={props.creature.moves[0]} topAttackable={props.topAttackable} bottomAttackable={props.bottomAttackable} />
								<YourMovePanel move={props.creature.moves[1]} topAttackable={props.topAttackable} bottomAttackable={props.bottomAttackable} />
							</div>

							<div className='row'>
								<YourMovePanel move={props.creature.moves[2]} topAttackable={props.topAttackable} bottomAttackable={props.bottomAttackable} />
								<YourMovePanel move={props.creature.moves[3]} topAttackable={props.topAttackable} bottomAttackable={props.bottomAttackable} />
							</div>
						</div>
					</div>

					<Dropdown style={{flex: '0 1 auto'}}>
						<Dropdown.Toggle>Items</Dropdown.Toggle>

						<Dropdown.Menu>
							{props.items.map((item, idx) => {
								return (
									<Dropdown.Item key={`item-${idx}`} className={item.exhausted ? 'disabled' : ''}>{item.name}</Dropdown.Item>
								);
							})}
						</Dropdown.Menu>
					</Dropdown>

					<div className='break mobile show' />
				</div>
			);
		};

		const EnemyCreature = props => {
			if (!props.creature) {
				return (
					<div className='panel' style={{maxWidth: '150px', height: 'calc(150px + 1em)'}}></div>
				);
			}

			return (
				<div className='panel' style={{maxWidth: '150px'}}>
					<img style={{flex: '0 1 auto', alignSelf: 'center'}} src={`/content/sprites/creatures/${props.creature.frontImage}`} />
					<span className='centered'><strong>{props.creature.name} {props.creature.currentHP}/{props.creature.maxHP}</strong></span>
				</div>
			);
		};

		return (
			<div className='battleContainer'>
				{this.props.battles.map((battle, index) => {
					return (
						<div key={`battle-${index}`} className={'battlePanel'}>
							<div className='table noMargin'>
								<div className='row'>
									<div className='col double'>
										<div className='panel' style={{width: 'calc(150px * 4.5)', minHeight: 'calc(150px * 2 + 2em)'}}>
											<YourCreaturePanel battleIndex={index} positionName={'top'} creature={battle.yourTopCreature} team={battle.yourTeam} items={battle.yourItems} topAttackable={!!battle.enemyTopCreature} bottomAttackable={!!battle.enemyBottomCreature} />
											<YourCreaturePanel battleIndex={index} positionName={'bottom'} creature={battle.yourBottomCreature} team={battle.yourTeam} items={battle.yourItems} topAttackable={!!battle.enemyTopCreature} bottomAttackable={!!battle.enemyBottomCreature} />
										</div>
									</div>

									<div className='col'>
										<div className='panel'  style={{maxWidth: '350px'}}>
											<div className='scrollable'>
												{battle.logs.map( (log, k) => <p key={`${index}-log-${k}`}>{log}</p>)}
											</div>

											<div className='panel' style={{flexDirection: 'row'}}>
												<Button style={{flex: '1'}} className={'disabled'}>Submit</Button>
												<div className='gap' />
												<Button onClick={e => this.resign(index)} style={{flex: '1'}}>Resign</Button>
											</div>
										</div>
									</div>

									<div className='col half'>
										<EnemyCreature creature={battle.enemyTopCreature} />
										<EnemyCreature creature={battle.enemyBottomCreature} />
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	//controller buttons
	resign(index) {
		if (confirm('Quit this battle?')) {
			this.sendYourBattlesRequest('/api/yourbattles/resign', index);
		}
	}

	//request function
	sendYourBattlesRequest(url, index, meta) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.props.setBattles(json.battles);
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
			meta: meta
		}));
	}
}

YourBattles.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setBattles: PropTypes.func.isRequired,
	setCreature: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		battles: store.battles.battles,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setProfile: (username, coins) => dispatch(setProfile(username, coins)),
		setBattles: (battles) => dispatch(setBattles(battles)),
		setCreature: (battleIndex, positionName, creature) => dispatch(setCreature(battleIndex, positionName, creature))
	};
};

YourBattles = connect(mapStoreToProps, mapDispatchToProps)(YourBattles);

export default YourBattles;