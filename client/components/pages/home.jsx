import React from 'react';
import Markdown from '../panels/markdown.jsx';
import NewsFeed from '../panels/news_feed.jsx';
import Button from '../button.jsx';

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
					<div className='panel' style={{justifyContent: 'flex-end', alignItems:'flex-end'}}>
						<Button to='/news' className='right' style={{maxWidth:'300px'}}>See more news...</Button>
					</div>
				</div>
			</div>
		);
	}
};

export default Home;