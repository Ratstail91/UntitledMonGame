import React from 'react';
import { withRouter } from 'react-router-dom';
import Button from '../button.jsx';

import NewsSelector from '../panels/news_selector.jsx';
import Markdown from '../panels/markdown.jsx';

class News extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			params: this.props.match.params
		};
	}

	render() {
		if (!this.state.params.article) {
			return (
				<div className='page'>
					<NewsSelector />
					<div className='panel' style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
						<Button to='/' className='right' style={{maxWidth: '300px'}}>Return Home</Button>
					</div>
				</div>
			);
		}

		return (
			<div className='page'>
				<Markdown url={`/content/news/${this.state.params.article}`} />
				<div className='panel' style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
					<Button to='/news' className='right' style={{maxWidth: '300px'}}>Back To News</Button>
					<div className='break' />
					<Button to='/' className='right' style={{maxWidth: '300px'}}>Return Home</Button>
				</div>
			</div>
		);
	}
}

export default withRouter(News);
