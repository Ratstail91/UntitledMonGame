import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
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
				<p>Battles go here.</p>
			);
        }

        console.log(this.props.battleBoxes);

		return null;
	}

	sendBattleBoxRequest(url, index) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					this.props.setBattleBoxes(json);
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

YourBattleBoxes = connect(mapStoreToProps, mapDispatchToProps)(YourBattleBoxes);

export default YourBattleBoxes;