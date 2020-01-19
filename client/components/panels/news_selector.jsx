import React from 'react';
import { connect } from 'react-redux';

import { setWarning } from '../../actions/warning.js';

class NewsSelector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			max: 0,
			fileNames: [],
			firstLines: [],
		};

		this.sendNewsRequest(-1);
	}

	render() {
		console.log(this.state);
		return null;
	}

	sendNewsRequest(total) {
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

		xhr.open('GET', '/api/newsheaders', true);
		xhr.send(JSON.stringify({
			total
		}));
	}
}

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

NewsSelector = connect(mapStoreToProps, mapDispatchToProps)(NewsSelector);

export default NewsSelector;
