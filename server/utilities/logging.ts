import pool from './database';

export function log(msg: object | string, ...args: any[]){
	if (typeof msg == 'object') {
		msg = JSON.stringify(msg);
	}

	let dateString = Date().replace(/\s\(.*\)/i, ''); //dumb formatting
	console.log(`log ${dateString}: ${msg} (${args.toString()})`);
	return msg;
}

export function logActivity(id: number) {
	let query = 'UPDATE accounts SET lastActivityTime = CURRENT_TIMESTAMP() WHERE id = ?;';
	pool.promise().query(query, [id]);
};