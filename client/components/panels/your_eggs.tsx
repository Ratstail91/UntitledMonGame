import React from 'react';
import { connect } from 'react-redux';
import { Dropdown } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { setWarning } from '../../actions/warning';
import { setProfile } from '../../actions/profile';
import { setEggs } from '../../actions/profile';

const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}


export interface OwnProps {
	
}

interface StateProps {
	id: number;
	token: number;
	eggs: any;
}
	
interface DispatchProps {
	setWarning: Function;
	setEggs: Function;
	setProfile: Function;
}
   
// All of the props combined
type Props = StateProps & DispatchProps & OwnProps
   
// Internal state
interface State {
	// internalComponentStateField: string
}

class YourEggs extends React.Component<Props, State> {
	constructor(props:Props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		this.sendYourEggsRequest('/api/youreggs');
	}

	render() {
		if (this.props.eggs.length == 0) {
			return (
				<p>Eggs go here.</p>
			);
		}

		//TODO: ticking hatch time

		return (
			<div className='eggContainer panel'>
				{this.props.eggs.map( (egg, idx) => {
					return (
						<div key={idx} className={'panel'}>
							<div className='eggPanel'>
								<img src={egg.hatchTime ? '/content/sprites/items/incubator.png' : `/content/sprites/eggs/${egg.element}.png`} />
								<span><strong>{capitalize(egg.element)} Egg</strong></span>
								<span><em>{egg.hatchTime ? 'Hatching ' + egg.hatchTime : ''}</em></span>
								<div className='break' />

								<Dropdown>
									<Dropdown.Toggle id={`actions-${idx}`}>Actions</Dropdown.Toggle>

									<Dropdown.Menu>
										<Dropdown.Item className={egg.hatchTime ? 'disabled' : ''} onClick={e => { e.preventDefault(); this.eggAction(idx, 'incubate'); }}>Incubate</Dropdown.Item>
										<Dropdown.Item className={egg.hatchTime ? 'disabled' : ''} onClick={e => { e.preventDefault(); this.eggAction(idx, 'sell'); }}>Sell</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</div>
							<div className='break' />
						</div>
					);
				})}
			</div>
		);
	}

	sendYourEggsRequest(url, index?) {
		//build the XHR
		const xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					const json = JSON.parse(xhr.responseText);
					if (json.profile) {
						this.props.setProfile(json.profile.username, json.profile.coins);
					}
					this.props.setEggs(json.eggs);
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

	eggAction(index, action) {
		switch(action) {
			case 'incubate':
				if (confirm('Incubate this egg?')) {
					this.sendYourEggsRequest('/api/youreggs/incubate', index);
				}
				return;

			case 'sell':
				if (confirm('Sell this egg?')) {
					this.sendYourEggsRequest('/api/youreggs/sell', index);
				}
				return;
		}
	}
}

const mapStoreToProps = (store) => {
	return {
		id: store.account.id,
		token: store.account.token,
		eggs: store.profile.eggs,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: (msg: string) => dispatch(setWarning(msg)),
		setProfile: (username:string, coins: number) => dispatch(setProfile(username, coins)),
		setEggs: (eggs) => dispatch(setEggs(eggs)),
	};
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStoreToProps, mapDispatchToProps)(YourEggs);