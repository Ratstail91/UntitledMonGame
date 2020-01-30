const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const apiShopPremiumsBuy = async (req, res) => {
	res.status(400).write('Sorry, the premium shop isn\'t ready yet.');
	res.end();
}

module.exports = {
	apiShopPremiumsBuy,
};