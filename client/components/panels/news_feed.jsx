import React from 'react';
import Markdown from './markdown.jsx';

class NewsFeed extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			fileNames: []
		};

		this.sendNewsRequest(10);
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
							<Markdown url={fn} />
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

		xhr.open('GET', '/api/newsfiles', true);
		xhr.send(JSON.stringify({
			total
		}));
	}
};

export default NewsFeed;
