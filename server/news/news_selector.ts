//environment variables
require('dotenv').config();

//libraries
import fs from 'fs';
import path from 'path';
import firstline from 'firstline';

import { log } from '../utilities/logging';
import { readFilenames } from './news_feed';

export const apiNewsHeaders = (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra ? obj.extra.toString() : ''));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
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

export const readFileHeaders = ({ msg }) => new Promise((resolve, reject) => {
	const fpath = path.join(__dirname, '..', '..', 'public', 'content', 'news');

	const firstLinePromises = msg.fileNames.map( fn => firstline(path.join(fpath, fn)) );

	const firstNot = (str, char) => { //find the first characte rthat is NOT "char"
		let i = 0;
		while (str[i] && str[i] == char) i++;
		return i;
	};

	return Promise.all(firstLinePromises)
		.then((firstlines: any) => firstlines.map( fl => fl.slice(firstNot(fl, '#')) ))
		.then(firstlines => firstlines.map( fl => fl.trim() ))
		.then(firstLines => resolve({ msg: { ...msg, firstLines }, extra: '' }))
		.catch(e => reject({ msg: 'readFileHeaders error', extra: e }))
	;
});
