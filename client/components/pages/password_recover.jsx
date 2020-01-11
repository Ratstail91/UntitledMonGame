import React from 'react';
import { withRouter, Link } from 'react-router-dom';

//panels
import PasswordRecoverPanel from '../panels/password_recover.jsx';

class PasswordRecover extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			recovered: ''
		}
	}

	render() {
		let Panel;

		if (!this.state.recovered) {
			Panel = () => {
				return (<PasswordRecoverPanel onSuccess={(msg) => this.setState( {recovered: msg} )} />);
			}
		} else {
			Panel = () => {
				return (<p>{this.state.recovered}</p>);
			}
		}

		return (
			<div className='page constrained'>
				<Panel />
				<Link to='/' className='centered'>Return Home</Link>
			</div>
		);
	}
};

export default withRouter(PasswordRecover);