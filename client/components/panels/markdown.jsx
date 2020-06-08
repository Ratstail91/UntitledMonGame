import React from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown/with-html';
import PropTypes from 'prop-types';
import { setWarning } from '../../actions/warning';

class Markdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			content: props.content || ''
		};

		if (!props.content) {
			if (!props.url) {
				throw new "Markdown requires either content or a url prop";
			}
			this.sendRequest(props.url);
		}
	}

	render() {
		if (this.state.content) {
			return (
				<ReactMarkdown source={this.state.content} escapeHtml={false} {...this.props} />
			);
		}

		return (
			<p className='centered'>Loading markdown...</p>
		);
	}

	sendRequest(url) {
		//build the XHR
		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					//on success
					this.setState({ content: xhr.responseText });
				}
				else {
					this.props.setWarning(xhr.responseText);
				}
			}
		};

		xhr.open('GET', url, true);
		xhr.send();
	}
};

Markdown.propTypes = {
	content: PropTypes.string,
	url: PropTypes.string,
	setWarning: PropTypes.func.isRequired
};

const mapStoreToProps = (store) => {
	return {
		//
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		setWarning: msg => dispatch(setWarning(msg))
	}
};

Markdown = connect(mapStoreToProps, mapDispatchToProps)(Markdown);

export default Markdown;