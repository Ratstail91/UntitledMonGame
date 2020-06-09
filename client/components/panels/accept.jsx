import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button';

import { setWarning } from '../../actions/warning';
import { setBattleBoxes } from '../../actions/battles';

//TODO: needs a better name, "accept" is far too generic
//DOCS: Accepts a challenge from another player
class Accept extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendAcceptRequest('/api/yourbattleboxes');
	}

	render() {
		if (this.props.battleBoxes.length == 0) {
			return (
				<p>Loading...</p>
			);
		}

		//preprocess the battleboxes
		let battleBoxArray = JSON.parse(JSON.stringify(this.props.battleBoxes || []));

		//make sure each battlebox fits a certain schema
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

			battleBox.meta.creatureCount = battleBox.content.reduce((acc, item) => !item || !item.name ? acc : acc + 1, 0);

			for (let i = 0; i < 6; i++) {
				battleBox.content[i] = battleBox.content[i] || { name: null, frontImage: null, boxSlot: i };
			}

			battleBox.content = battleBox.content.sort((a, b) => a.boxSlot - b.boxSlot);

			return battleBox;
		});

		//use the above schema to display battle boxes on the accept screen
		return (
			<div>
				<h1>Select your box</h1>
				<div className='table panel'>
					{battleBoxArray.map((battleBox, index) => {
						return (
							<div key={index} className={'row break'} style={{alignItems: 'center', background: battleBox.meta.locked ? 'pink' : 'lightblue'}}>
								<div className='col'>
									<Button className={battleBox.locked ? '' : 'disabled'} onClick={() => this.sendAcceptRequest('/api/yourbattles/join', index)}>Select Box {index + 1}</Button>
								</div>

								<p className='col'>{battleBox.meta.creatureCount} Creatures</p>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	sendAcceptRequest(url, index) {
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
					if (json.msg) {
						alert(json.msg);
						if (this.props.onSuccess) {
							this.props.onSuccess(json.msg);
						}
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
			inviteCode: this.props.inviteCode
		}));
	}
};

Accept.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	battleBoxes: PropTypes.array.isRequired,
	setWarning: PropTypes.func.isRequired,
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
		setBattleBoxes: (battleBoxes) => dispatch(setBattleBoxes(battleBoxes)),
	};
};

export default connect(mapStoreToProps, mapDispatchToProps)(Accept);
