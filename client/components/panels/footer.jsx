import React from 'react';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
	render() {
		return (
			<footer className='page-footer centered'>
				<p>Copyright <a href='https://krgamestudios.com'>KR Game Studios</a> 2020 - <Link to='/privacypolicy'>Privacy Policy</Link> - <Link to='/credits'>Credits</Link></p>
			</footer>
		);
	}
};

export default Footer;
