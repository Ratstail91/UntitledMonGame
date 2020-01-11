import React from 'react';

class Home extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='page'>
				<div className='panel'>
					<p>Hello world</p>
				</div>
			</div>
		);
	}
};

export default Home;