const { apiShopEggs, runDailyShopRefresh } = require('./shop_eggs.js');
const { apiShopEggsBuy } = require('./shop_eggs_buy.js');

module.exports = {
	apiShopEggs,
	runDailyShopRefresh,

	apiShopEggsBuy,
};