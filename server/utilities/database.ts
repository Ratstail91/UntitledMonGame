//libraries
import { createPool } from 'mysql2';

//utilities
import { log } from './logging';

// Create a connection pool
const pool = createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port:  parseInt(process.env.DB_PORT),
	connectionLimit:10,
	queueLimit: 0,
	enableKeepAlive: true
})

pool.on("connection", (connection) => {
	connection.on("error", (err) => {
		log(`MySQL connection error ${err}`)
	});
});

export default pool;
