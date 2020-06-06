//libraries
let mysql = require('mysql2');

//utilities
let { log } = require('./logging.js');

// Create a connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	connectionLimit:10,
	queueLimit: 0,
	enableKeepAlive: true
})

pool.on("connection", (connection) => {
	connection.on("error", (err) => {
		log(`MySQL connection error ${err}`)
	});
});

module.exports = pool;
