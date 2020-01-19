import React from 'react';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import Button from '../button.jsx';

import NewsSelector from '../panels/news_selector.jsx';
import Markdown from '../panels/news_selector.jsx';

class News extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			params: queryString.parse(props.location.search)
		};
	}

	render() {
		if (!this.state.params.article) {
			return (
				<div className='page'>
					<NewsSelector />
				</div>
			);
		}

		return (
			<div className='page'>
				<Markdown url={this.state.params.article} />
				<Button to='/news'>Back To News</Button>
				<Button to='/'>Return Home</Button>
			</div>
		);
	}
}

export default withRouter(News);
