import React from 'react';
import Markdown from '../panels/markdown';
import NewsFeed from '../panels/news_feed';
import Button from '../button';

class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='page'>
				<div className='panel'>
					<div className='break double' />
					<Markdown className="content" url={require('../../markdown/home.md').default} />
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