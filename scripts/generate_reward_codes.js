require('dotenv').config();

const pool = require('./../server/utilities/database');
const fs = require('fs');
const path = require('path');

const total = 50;
const type = 'null';
const randomQuery = 'INSERT INTO rewardCodes (flag, code) VALUES (?, (SELECT FLOOR(RAND() * 4000000000)));';
const fetchQuery = 'SELECT code FROM rewardCodes WHERE used = FALSE;';

(async () => {
	//generate the random numbers
	for (let i = 0; i < total; i++) {
		await pool.promise().execute(randomQuery, [type]);
	}

	//fetch and save the random numbers
	const codes = await pool.promise().execute(fetchQuery);

	const urls = codes[0].map(({ code }) => `https://eggtrainer.com/signup?code=${code}\n`);

	for (let i = 0; i < urls.length; i++) {
		fs.writeFileSync(path.join(__dirname, '..', `${type}_codes.txt`), urls[i], {encoding:"utf-8", flag: 'as'});
	}

	pool.end();
})();

