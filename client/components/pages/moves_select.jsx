import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from '../button';

//panels
import YourProfilePanel from '../panels/your_profile';
import MovesSelectPanel from '../panels/moves_select';

class MovesSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (!this.props.loggedIn || this.props.index < 0) {
			this.props.history.push('/');
		}
	}

	render() {
		return (
			<div className='page'>
				<h1 className='centered'>Move Selection</h1>
				<YourProfilePanel />
				<MovesSelectPanel />
				<div className='panel' style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
					<div className='break' />
					<Button to='/yourprofile' className='right' style={{maxWidth: '300px'}}>Back To Profile</Button>
					<div className='break' />
				</div>
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		loggedIn: !!store.account.id,
		index: store.inspect.index,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		//
	};
};

MovesSelect = connect(mapStoreToProps, mapDispatchToProps)(MovesSelect);

export default withRouter(MovesSelect);