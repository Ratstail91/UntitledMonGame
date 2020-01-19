//environment variables
require('dotenv').config();

//libraries
let fs = require('fs');
let path = require('path');

const { log } = require('../utilities/logging.js');

const apiNewsFiles = (req, res) => {
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
		.then(handleSuccess)
		.catch(handleRejection)
	;
}

const readFilenames = (req) => new Promise((resolve, reject) => {
	let fpath = path.join(__dirname, '..', '..', 'public', 'news');

	let fileNames = fs.readdirSync(fpath);

	//set the maximum
	let max = parseInt(req.body.total) || 99;
	if (isNaN(max) || max > fileNames.total) {
		max = fileNames.total;
	}

	//process the result
	fileNames = fileNames.slice(-1 * max);
	fileNames = fileNames.map(fn => `/news/${fn}`);

	//actually send the data
	return resolve({ msg: { fileNames }, extra: '' });
});

module.exports = {
	apiNewsFiles,

	//for testing
	readFilenames,
};