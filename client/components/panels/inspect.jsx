import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

class Inspect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendInspectRequest('/api/yourcreatures/inspect', this.props.index);
	}

	render() {
		if (this.props.index < 0 || Object.keys(this.state).length <= 0) {
			return (
				<div className='panel'>
					<p>Inspect goes here.</p>
				</div>
			);
		}

		const Line = (props) => {
			return (
				<div className='row' style={{borderBottom: '1px solid #e8e8e8', marginBottom: '.5em'}}>
					<div className='col double'>
						<p className='left' style={{width: '100%', paddingBottom: '0'}}><strong>{props.left}</strong></p>
					</div>

					<div className='col'>
						<p className='left' style={{width: '100%', paddingBottom: '0'}}>{props.right}</p>
					</div>
				</div>
			);
		};

		return (
			<div className='panel table' style={{flexDirection: 'row'}}>
				<div className='row'>
					<div className='col centered'>
						<img className='shrink' src={`/content/sprites/creatures/${this.state.species.frontImage}`} style={{maxWidth: '500px', maxHeight: '500px'}} />
					</div>

					<div className='col'>
						<div className='table noCollapse'>
							<Line left={'Name'} right={this.state.species.name} />
							<Line left={'Nickname'} right={this.state.creature.nickname ? this.state.creature.nickname : '<none>'} />
							<Line left={'Element'} right={capitalize(this.state.species.element)} />
							<Line left={'Rarity'} right={capitalize(this.state.species.egg.rarity)} />

							<Line left={'Species Health'} right={this.state.species.stats.health} />
							<Line left={'Species Speed'} right={this.state.species.stats.speed} />
							<Line left={'Species Physical Attack'} right={this.state.species.stats.physicalAttack} />
							<Line left={'Species Physical Defense'} right={this.state.species.stats.physicalDefense} />
							<Line left={'Species Magical Attack'} right={this.state.species.stats.magicalAttack} />
							<Line left={'Species Magical Defense'} right={this.state.species.stats.magicalDefense} />

							<Line left={'Genetic Health'} right={`${this.state.creature.geneticPointsHealth}/16`} />
							<Line left={'Genetic Speed'} right={`${this.state.creature.geneticPointsSpeed}/16`} />
							<Line left={'Genetic Strength'} right={`${this.state.creature.geneticPointsStrength}/16`} />
							<Line left={'Genetic Power'} right={`${this.state.creature.geneticPointsPower}/16`} />

							<Line left={'Training Health'} right={`${this.state.creature.statPointsHealth}/16`} />
							<Line left={'Training Speed'} right={`${this.state.creature.statPointsSpeed}/16`} />
							<Line left={'Training Strength'} right={`${this.state.creature.statPointsStrength}/16`} />
							<Line left={'Training Power'} right={`${this.state.creature.statPointsPower}/16`} />
						</div>
					</div>
				</div>
			</div>
		);
	}

	sendInspectRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.setState(json);
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
}

Inspect.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	index: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		index: store.inspect.index,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
	};
};

Inspect = connect(mapStoreToProps, mapDispatchToProps)(Inspect);

export default Inspect;
