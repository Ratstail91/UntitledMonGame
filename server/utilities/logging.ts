import pool from './database';

export const log = (msg: object | string, ...args: any[]) => {
	if (typeof msg == 'object') {
		msg = JSON.stringify(msg);
	}

	let dateString = Date().replace(/\s\(.*\)/i, ''); //dumb formatting
	// eslint-disable-next-line no-console
	console.log(`log ${dateString}: ${msg} (${args.toString()})`);
	return msg;
}

export const logActivity = (id: number) => {
	let query = 'UPDATE accounts SET lastActivityTime = CURRENT_TIMESTAMP() WHERE id = ?;';
	pool.promise().query(query, [id]);
};
