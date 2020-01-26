import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { setWarning } from '../../actions/warning.js';

class ServerTime extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			offset: 0,
			interval: null
		};
		this.fetchTimezoneOffset();
	}

	fetchTimezoneOffset() {
		clearInterval(this.state.interval);
		fetch('/api/timezoneoffset')
			.then(offset => this.setState({
				offset: offset,
				interval: setInterval(() => this.setState({}), 1000)
			}))
			.catch(e => this.props.setWarning(e))
		;
	}

	render() {
		return (
			<p className='servertime'>Server Time: {moment(this.props.offset).format('h:mm:ss')}</p>
		);
	}
};

const mapStoreToProps = (store) => {
	return {
		//
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	};
};

ServerTime = connect(mapStoreToProps, mapDispatchToProps)(ServerTime);

export default ServerTime;