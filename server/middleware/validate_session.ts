import { log, logActivity } from '../utilities/logging';
import pool from '../utilities/database';

export default async (err, req, res, next) => {
	const query = 'SELECT * FROM sessions WHERE accountId = ? AND token = ?;';

	try {
		const results: any = await pool.promise().query(query, [req.body.id, req.body.token]);

		if (results[0].length === 0) {
			res.status(400).send(log('Session Timed Out', req.body));
			return;
		}

		logActivity(req.body.id);
		next();
	} catch(e) {
		res.status(400).send(log('validateSession error', e));
	}
};
