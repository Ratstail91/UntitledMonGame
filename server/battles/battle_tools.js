const pool = require("../utilities/database.js");

const countTotalBattleBoxItems = async (accountId) => {
	const query = 'SELECT COUNT(*) AS total FROM items WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) AND idx = ?;';
	return (await pool.promise().query(query, [accountId, 'battlebox']))[0][0].total;
};

const getBattleBoxes = async (accountId) => {
	let battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [accountId]))[0];
	const totalBattleBoxes = await countTotalBattleBoxItems(accountId);

	//if there are more item battleboxes than DB battle boxes
	if (battleBoxes.length != totalBattleBoxes) {
		const query = 'INSERT INTO battleBoxes (profileId) VALUES ((SELECT id FROM profiles WHERE accountId = ?));';
		for (let i = 0; i < totalBattleBoxes - battleBoxes.length; i++) {
			await pool.promise().query(query, [accountId]);
		}

		//grab new battleboxes
		battleBoxes = (await pool.promise().query('SELECT * FROM battleBoxes WHERE profileId IN (SELECT id FROM profiles WHERE accountId = ?) ORDER BY id;', [accountId]))[0];
	}

	return battleBoxes;
};

const getBattleBoxSlots = async (boxId) => {
	return (await pool.promise().query('SELECT * FROM battleBoxSlots WHERE battleBoxId = ? ORDER BY boxSlot ASC;', boxId))[0];
};

module.exports = {
	countTotalBattleBoxItems,
	getBattleBoxes,
	getBattleBoxSlots,
};
