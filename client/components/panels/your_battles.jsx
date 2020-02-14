import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../button.jsx';

import { setWarning } from '../../actions/warning.js';
import { setBattles } from '../../actions/battles.js';

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

		return (
			<div className='panel'>
				{this.props.battles.map((battle, index) => {
					return (
						<div key={index} className={'panel'}>
							<p>Battle {battle.id}</p>
							<Button onClick={e => this.resign(index)}>Resign</Button>
						</div>
					);
				})}
			</div>
		);
	}

	resign(index) {
		if (confirm('Quit this battle?')) {
			this.sendYourBattlesRequest('/api/yourbattles/resign', index);
		}
	}

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
	};
};

YourBattles = connect(mapStoreToProps, mapDispatchToProps)(YourBattles);

export default YourBattles;