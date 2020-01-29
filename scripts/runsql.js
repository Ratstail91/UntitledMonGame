// Runs any sql file in sql folder
//environment variables
require('dotenv').config();

//libraries
const mysql = require('mysql2');
const fs = require('fs')
const path = require('path')

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	multipleStatements:true
});
console.log(path.join(__dirname,'..','sql',process.argv[2]))

// Get the file with sql statements
const updateFile = fs.readFileSync(path.join(__dirname,'..','sql',process.argv[2]), {encoding:"utf-8"});

connection.connect(err => {
	if (err) throw err;

	connection.query(updateFile, err => {
		if (err) throw err;
		console.log("Database is updated");
		connection.end();
	});
});