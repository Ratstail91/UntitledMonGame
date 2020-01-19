//environment variables
require('dotenv').config();

//libraries
const fs = require('fs');
const path = require('path');
const firstline = require('firstline');

const { log } = require('../utilities/logging.js');
const { readFilenames } = require('./news_feed.js');

const apiNewsHeaders = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	//pass the process along
	return readFilenames(req)
		.then(readFileHeaders)
		.then(handleSuccess)
		.catch(handleRejection)
	;
}

const readFileHeaders = ({ msg }) => new Promise((resolve, reject) => {
	const fpath = path.join(__dirname, '..', '..', 'public');

	const firstLinePromises = msg.fileNames.map( fn => firstline(path.join(fpath, fn)) );

	return Promise.all(firstLinePromises)
		.then(firstLines => resolve({ msg: { ...msg, firstLines }, extra: '' }))
		.catch(e => reject({ msg: 'readFileHeaders error', extra: e }))
	;
});

module.exports = {
	apiNewsHeaders,
	readFileHeaders,
};