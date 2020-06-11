import React from 'react';
import Markdown from '../panels/markdown';

class MarkdownWrapper extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='page'>
				<Markdown url={this.props.url} content={this.props.content} />
			</div>
		);
	}
};

export default MarkdownWrapper;
