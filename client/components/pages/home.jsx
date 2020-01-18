import React from 'react';
import Markdown from '../panels/markdown.jsx';
import NewsFeed from '../panels/news_feed.jsx';

class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='page'>
				<div className='panel'>
					<Markdown url={'content/home.md'} />
					<h2>News Feed</h2>
					<NewsFeed />
				</div>
			</div>
		);
	}
};

export default Home;