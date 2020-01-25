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
					<span className='centered'><strong><h1>News Feed</h1></strong></span>
					<NewsFeed />
					<div className='panel' style={{justifyContent: 'flex-end', alignItems:'flex-end'}}>
						<Button to='/news' className='right' style={{maxWidth:'300px'}}>See more news...</Button>
						<div className='break' />
					</div>
				</div>
			</div>
		);
	}
};

export default Home;