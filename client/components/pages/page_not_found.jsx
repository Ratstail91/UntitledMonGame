import React from 'react';
import { withRouter, Link } from 'react-router-dom';

class PageNotFound extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const style = {
			justifyContent: 'center'
		};

		return (
			<div className='page centered' style={style}>
				<h1>Page Not Found</h1>
				<Link to='/'>Return Home</Link>
			</div>
		);
	}
};

export default withRouter(PageNotFound);
