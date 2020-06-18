import React from 'react';
import { withRouter, Link } from 'react-router-dom';

class PageNotFound extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const style = {
			justifyContent: 'center',
			alignItems: 'center'
		};

		return (
			<div className='page centered' style={style}>
				<h1>Page Not Found</h1>
				<img src='/content/404.png' width='500px' />
				<Link to='/'>Return Home</Link>
			</div>
		);
	}
};

export default withRouter(PageNotFound);
