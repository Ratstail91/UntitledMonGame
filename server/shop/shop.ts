import { apiShopEggs, runDailyShopEggRefresh } from './shop_eggs';
import { apiShopEggsBuy } from './shop_eggs_buy';
import { apiShopItems, runWeeklyShopItemRefresh } from './shop_items';
import { apiShopItemsBuy } from './shop_items_buy';
import { apiShopPremiums, runDailyShopPremiumRefresh } from './shop_premiums';

export default {
	apiShopEggs,
	apiShopEggsBuy,

	runDailyShopEggRefresh,

	apiShopItems,
	apiShopItemsBuy,

	runWeeklyShopItemRefresh,

	apiShopPremiums,

	runDailyShopPremiumRefresh
};
