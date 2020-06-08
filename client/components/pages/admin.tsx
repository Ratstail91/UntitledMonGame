import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

//panels
import AdminDisplay from '../panels/admin_display';
import { Dispatch } from 'redux';


export interface OwnProps {
	// propFromParent: number
}

interface StateProps {
	loggedIn: boolean
}
	
interface DispatchProps {
	// onSomeEvent: () => void
}
   
// All of the props combined
type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps
   
// Internal state
interface State {
	// internalComponentStateField: string
}


class Admin extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (!this.props.loggedIn) {
			this.props.history.push('/');
		}
	}

	render() {
		return (
			<div className='page'>
				<AdminDisplay />
			</div>
		);
	}
};

function mapStoreToProps(store, ownProps: OwnProps): StateProps {
	return {
		loggedIn: store.account.id !== undefined && store.account.id !== 0
	}
};

function mapDispatchToProps(dispatch: Dispatch<any>,  ownProps: OwnProps): DispatchProps {
	return {
		//
	}
};


export default withRouter(
	connect<StateProps, DispatchProps, OwnProps>(mapStoreToProps, mapDispatchToProps)(Admin)
);