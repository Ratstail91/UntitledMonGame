var pool = require('./../server/utilities/database');

(async () => {
	let result = await Promise.all([
		pool.promise().execute("delete from accounts"),
		pool.promise().execute("delete from signups"),
		pool.promise().execute("delete from sessions"),
		pool.promise().execute("delete from passwordRecover"),
		pool.promise().execute("delete from bannedEmails"),
	])

	// Destroy the pool
	pool.end()
})()
