import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning.js';
import { setEggs } from '../../actions/profile.js';

class YourEggs extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendEggsRequest();
	}

	render() {
		return (
			<div className='panel'>
				{this.props.eggs.map( (egg, idx) => {
					return (
						<div key={idx} className='panel' style={{display: 'inline-block', verticalAlign: 'top'}}>
							<img src={`/content/sprites/${egg.element}.png`} />
						</div>
					);
				})}
			</div>
		);
	}

	sendEggsRequest() {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const eggs = JSON.parse(xhr.responseText);
					this.props.setEggs(eggs);
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('POST', '/api/youreggs', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send(JSON.stringify({
			id: this.props.id,
			token: this.props.token
		}));
	}

	sendSpeciesRequest(speciesName) {
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					this.setState({
						species: {
							...this.state.species,
							...JSON.parse(xhr.responseText)
						}
					});
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		}

		xhr.open('GET', `/api/creature?species=${speciesName}`, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.send();
	}
}

YourEggs.propTypes = {
	id: PropTypes.number.isRequired,
	token: PropTypes.number.isRequired,
	setWarning: PropTypes.func.isRequired,
	setEggs: PropTypes.func.isRequired,
};

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		eggs: store.profile.eggs,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg)),
		setEggs: (eggs) => dispatch(setEggs(eggs))
	};
};

YourEggs = connect(mapStoreToProps, mapDispatchToProps)(YourEggs);

export default YourEggs;