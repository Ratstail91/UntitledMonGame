import React from 'react';
import { connect } from 'react-redux';
import Button from '../button';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning';
import { setProfile } from '../../actions/profile';
import { setCreatures } from '../../actions/profile';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

class MovesSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			available: [],
			owned: [],
			equipped: [],

			movesIndex: {}
		};
	}

	componentDidMount() {
		if (this.props.creatures.length == 0) {
			this.sendRequest('/api/yourcreatures', 'POST', null, json => this.props.setCreatures(json.creatures));
		}

		this.sendRequest('/api/yourcreatures/moves', 'POST', this.props.index, json => this.setState(json));
	}

	componentDidUpdate() {
		if (Object.keys(this.state.movesIndex).length == 0 && Object.keys(this.state.available).length != 0) {
			this.sendRequest(`/api/moves?${this.state.available.map(m => 'move=' + m).join('&')}`, 'GET', null, json => this.setState({ movesIndex: json }));
		}
	}

	render() {
		if (this.props.index < 0 || Object.keys(this.state).length <= 0) {
			return (
				<div className='panel'>
					<p>Move selection goes here.</p>
				</div>
			);
		}

		const rowStyle = {
			borderBottom: '1px solid #e8e8e8',
			marginBottom: '.5em',
			alignItems: 'center'
		};

		if (this.props.creatures.length == 0) {
			return null;
		}

		//DOCS: movesIndex is an array of moves that exist.

		return (
			<div className='panel table' style={{flexDirection: 'row'}}>
				<div className='row'>
					<div className='col centered'>
						<img className='shrink' src={`/content/sprites/creatures/${this.props.creatures[this.props.index].frontImage}`} style={{maxWidth: '500px', maxHeight: '500px'}} />
					</div>

					<div className='col table noCollapse'>
						{this.state.available.map(move => {
							//BUGFIX: check that movesIndex is loaded
							if (Object.keys(this.state.movesIndex).length == 0) {
								return;
							}

							//BUGFIX: available move not in the index
							//NOTE: If any move is ever removed, it should be left in the "owned" table, but unequipped
							if (!this.state.movesIndex[move]) {
								return;
							}

							//moves are available but not owned
							if (this.state.owned.filter(obj => obj.idx == move).length == 0) {
								return (
									<div key={move} className='row' style={rowStyle}>
										<div className='col'>
											<p><strong>{this.state.movesIndex[move].name}</strong></p>
											<p><em>{this.state.movesIndex[move].description}</em></p>
											<p>{capitalize(this.state.movesIndex[move].type)} - {capitalize(this.state.movesIndex[move].element)}<span className='mobile hide'> - {this.state.movesIndex[move].damage} damage</span></p>
											<p className='mobile show'>{this.state.movesIndex[move].damage} damage</p>
										</div>

										<div className='col'>
											<Button onClick={e => {
												e.preventDefault();
												e.persist();
												e.target.setAttribute('disabled', 'disabled');
												this.sendRequest('/api/yourcreatures/moves/buy', 'POST', { index: this.props.index, move: move }, json => {
													this.setState(json);
													e.target.removeAttribute('disabled');
													this.sendRequest('/api/yourprofile', 'POST', null, json => this.props.setProfile(json.profile.username, json.profile.coins) );
												});
											}}
											>Buy - {this.state.movesIndex[move].value} coins</Button>
										</div>
									</div>
								);
							}

							//moves are equipped
							if (this.state.equipped.filter(obj => obj.idx == move).length > 0) {
								return (
									<div key={move} className='row' style={rowStyle}>
										<div className='col'>
											<p><strong>{this.state.movesIndex[move].name}</strong></p>
											<p><em>{this.state.movesIndex[move].description}</em></p>
											<p>{capitalize(this.state.movesIndex[move].type)} - {capitalize(this.state.movesIndex[move].element)}<span className='mobile hide'> - {this.state.movesIndex[move].damage} damage</span></p>
											<p className='mobile show'>{this.state.movesIndex[move].damage} damage</p>
										</div>

										<div className='col'>
										<Button onClick={e => { e.preventDefault(); e.persist(); e.target.setAttribute('disabled', 'disabled'); this.sendRequest('/api/yourcreatures/moves/unequip', 'POST', { index: this.props.index, move: move }, json => { this.setState(json); e.target.removeAttribute('disabled'); } )}}>Unequip</Button>
										</div>
									</div>
								);
							}

							//moves are not equipped
							return (
								<div key={move} className='row' style={rowStyle}>
									<div className='col'>
										<p><strong>{this.state.movesIndex[move].name}</strong></p>
										<p><em>{this.state.movesIndex[move].description}</em></p>
										<p>{capitalize(this.state.movesIndex[move].type)} - {capitalize(this.state.movesIndex[move].element)}<span className='mobile hide'> - {this.state.movesIndex[move].damage} damage</span></p>
										<p className='mobile show'>{this.state.movesIndex[move].damage} damage</p>
									</div>

									<div className='col'>
										<Button onClick={e => { e.preventDefault(); e.persist(); e.target.setAttribute('disabled', 'disabled'); this.sendRequest('/api/yourcreatures/moves/equip', 'POST', { index: this.props.index, move: move }, json => { this.setState(json); e.target.removeAttribute('disabled'); } )}}>Equip</Button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	sendRequest(url, method, index, onSuccess) {
		//HACK: pass multiple parameters instead of one
		let move = null;
		if (typeof index === 'object' && index !== null) {
			move = index.move;
			index = index.index;
		}

		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					onSuccess(json);
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open(method, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token,
			index: index,
			move: move
		}));
	}
}

MovesSelect.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	index: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setProfile: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		index: store.inspect.index,
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

MovesSelect = connect(mapStoreToProps, mapDispatchToProps)(MovesSelect);

export default MovesSelect;
