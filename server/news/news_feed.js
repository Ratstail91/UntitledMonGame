//environment variables
require('dotenv').config();

//libraries
const fs = require('fs');
const path = require('path');

const { log } = require('../utilities/logging.js');

const apiNewsFiles = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	};

	//pass the process along
	return readFilenames(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
}

const readFilenames = (req) => new Promise((resolve, reject) => {
	const fpath = path.join(__dirname, '..', '..', 'public', 'content', 'news');

	let fileNames = fs.readdirSync(fpath);

	//set the maximum
	let max = parseInt(req.query.total);
	if (isNaN(max) || max > fileNames.total || max <= 0) {
		max = fileNames.length;
	}

	//process the result
	fileNames = fileNames.slice(-1 * max);

	//actually send the data
	return resolve({ msg: { max, fileNames }, extra: '' });
});

module.exports = {
	apiNewsFiles,
	readFilenames,
};