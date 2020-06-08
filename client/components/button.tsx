import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function Button(props) {
	if (props.to) {
		return (
			<LinkContainer {...props}>
				<BootstrapButton {...props} />
			</LinkContainer>
		);
	}

	return (
		<BootstrapButton {...props} />
	);
}

export default Button;