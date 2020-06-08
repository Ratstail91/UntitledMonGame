import React from 'react';
import { connect } from 'react-redux';
import Markdown from './markdown';

import { setWarning } from '../../actions/warning';

class NewsFeed extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			max: 0,
			fileNames: [],
		};

		this.sendNewsRequest(3);
	}

	render() {
		//maps over the filenames and converts them into elements of a 'list'
		return (
			<div className='panel'>
			{
				this.state.fileNames.reverse().map(fn => {
					return (
						<div key={fn}>
							<hr />
							<Markdown url={`/content/news/${fn}`} />
						</div>
					);
				})
			}
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

		xhr.open('GET', `/api/newsfiles?total=${total}`, true);
		xhr.send();
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

NewsFeed = connect(mapStoreToProps, mapDispatchToProps)(NewsFeed);

export default NewsFeed;
