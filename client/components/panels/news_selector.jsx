import React from 'react';
import { Link, withRouter } from 'react-router-dom';
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
		let lines = [];

		for (let i = this.state.max -1; i >= 0; i--) { //lazy backwards
			lines.push(
				<div key={this.state.fileNames[i]}>
					<hr />
					<Link to={`/news/${this.state.fileNames[i]}`}>{this.state.firstLines[i]}</Link>
				</div>
			);
		}

		return (
			<div className='panel'>
				{lines}
			</div>
		);
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

		xhr.open('GET', `/api/newsheaders?total=${total}`, true);
		xhr.send();
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

export default withRouter(NewsSelector);
