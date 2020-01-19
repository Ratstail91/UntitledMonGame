import React from 'react';
import { connect } from 'react-redux';
import { setWarning } from '../../actions/warning.js';

class Warning extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		//no warning
		if (!this.props.text) {
			return (
				<span></span>
			);
		}

		console.log('WARNING: ', this.props.text);

		//render the warning
		return (
			<div className='warning'>
				<p style={{margin:'auto'}}>{this.props.text}</p>
				<strong><a style={{marginLeft:'-1em', fontSize: '1.4em', color: 'black'}} href='#' onClick={() => this.props.clearWarning()}>X</a></strong>
			</div>
		);
	}
};

const mapStoreToProps = store => {
	return {
		text: store.warning.text
	}
};

const mapDispatchToProps = dispatch => {
	return {
		clearWarning: () => dispatch(setWarning(''))
	}
};

Warning = connect(mapStoreToProps, mapDispatchToProps)(Warning);

export default Warning;