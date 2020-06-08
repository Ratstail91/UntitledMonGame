//environment variables
require('dotenv').config();

//libraries
import fs from 'fs';
import path from 'path';

import { log } from '../utilities/logging';

export const apiNewsFiles = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	};

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	};

	//pass the process along
	return readFilenames(req)
		.then(handleSuccess)
		.catch(handleRejection)
	;
}

export const readFilenames = (req) => new Promise((resolve, reject) => {
	const fpath = path.join(__dirname, '..', '..', 'public', 'content', 'news');

	let fileNames = fs.readdirSync(fpath);

	//set the maximum
	let max = parseInt(req.query.total);
	if (isNaN(max) || max > fileNames.length || max <= 0) {
		max = fileNames.length;
	}

	//process the result
	fileNames = fileNames.slice(-1 * max);

	//actually send the data
	return resolve({ msg: { max, fileNames }, extra: '' });
});

