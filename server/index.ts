//environment variables
require('dotenv').config();

//libraries
import express from 'express';
const app = express();
const http = require('http').Server(app);
import bodyParser from 'body-parser';
import path from 'path';

//utilities
import { log } from './utilities/logging';

// Initialise connection pool
import pool from './utilities/database';

// Test connection
pool.getConnection((err, connection) => {
	if (err) throw err;

	log("Connection is established");
	connection.release();
});

// Add body parser
app.use(bodyParser.json());

//analytics
import * as analytics from './analytics/analytics';
analytics.runDailySnapshots();

//news
import * as news from './news/news';
app.get('/api/newsfiles', news.apiNewsFiles);
app.get('/api/newsheaders', news.apiNewsHeaders);

//gameplay
import { runSoftlockPicker } from './softlock_picker';
runSoftlockPicker();

//public-facing only
import * as gameplay from './gameplay/gameplay';
app.get('/api/creatures', gameplay.apiCreatures);
app.get('/api/items', gameplay.apiItems);
app.get('/api/moves', gameplay.apiMoves);
app.get('/api/elements', gameplay.apiElements);

//accounts
import accounts from './accounts/accounts';
app.post('/api/signup', accounts.apiSignup);
app.get('/api/verify', accounts.apiVerify);
app.post('/api/login', accounts.apiLogin);
app.post('/api/logout', accounts.apiLogout);
app.post('/api/passwordchange', accounts.apiPasswordChange);
app.post('/api/passwordrecover', accounts.apiPasswordRecover);
app.post('/api/passwordreset', accounts.apiPasswordReset);

import profiles from './profiles/profiles';

app.post('/api/yourprofile', profiles.apiYourProfile);
app.post('/api/yourcreatures', profiles.apiYourCreatures);
app.post('/api/yourcreatures/inspect', profiles.apiYourCreaturesInspect);

profiles.runTrainJob();
app.post('/api/yourcreatures/train', profiles.apiYourCreaturesTrain);
app.post('/api/yourcreatures/train/cancel', profiles.apiYourCreaturesTrainCancel);

app.post('/api/yourcreatures/moves', profiles.apiYourCreaturesMoves);
app.post('/api/yourcreatures/moves/buy', profiles.apiYourCreaturesMovesBuy);
app.post('/api/yourcreatures/moves/equip', profiles.apiYourCreaturesMovesEquip);
app.post('/api/yourcreatures/moves/unequip', profiles.apiYourCreaturesMovesUnequip);

profiles.runBreedingJob();
app.post('/api/yourcreatures/breed', profiles.apiYourCreaturesBreed);
app.post('/api/yourcreatures/breed/cancel', profiles.apiYourCreaturesBreedCancel);
app.post('/api/yourcreatures/release', profiles.apiYourCreaturesRelease);

profiles.runEggHatchJob();
app.post('/api/youreggs', profiles.apiYourEggs);
app.post('/api/youreggs/sell', profiles.apiYourEggsSell);
app.post('/api/youreggs/incubate', profiles.apiYourEggsIncubate);

app.post('/api/youritems', profiles.apiYourItems);
app.post('/api/youritems/sell', profiles.apiYourItemsSell);

import battles from './battles/battles';
app.post('/api/yourbattleboxes', battles.apiYourBattleBoxes);
app.post('/api/yourbattleboxes/insert', battles.apiYourBattleBoxesInsert);
app.post('/api/yourbattleboxes/remove', battles.apiYourBattleBoxesRemove);
app.post('/api/yourbattleboxes/shift', battles.apiYourBattleBoxesShift);
app.post('/api/yourbattleboxes/lock/toggle', battles.apiYourBattleBoxesLockToggle);

app.post('/api/yourbattles', battles.apiYourBattles);
app.post('/api/yourbattles/invite', battles.apiYourBattlesInvite);
app.post('/api/yourbattles/join', battles.apiYourBattlesJoin);
app.post('/api/yourbattles/resign', battles.apiYourBattlesResign);

import shop from './shop/shop';
shop.runDailyShopEggRefresh();
app.get('/api/shopeggs', shop.apiShopEggs);
app.post('/api/shopeggs/buy', shop.apiShopEggsBuy);

shop.runWeeklyShopItemRefresh();
app.get('/api/shopitems', shop.apiShopItems);
app.post('/api/shopitems/buy', shop.apiShopItemsBuy);

shop.runDailyShopPremiumRefresh();
app.get('/api/shoppremiums', shop.apiShopPremiums);

//financials
import financial from './financial/financial';
financial.connectBraintree();
app.get('/api/shoppremiums/clienttoken', financial.apiGenerateClientToken);
app.post('/api/shoppremiums/checkout', financial.apiCheckout);

//privacy
import privacy from './privacy/privacy';
app.post('/api/privacysettings', privacy.apiSettings);
app.put('/api/privacysettings', privacy.apiUpdateSettings);
app.delete('/api/account', privacy.apiDeleteAccount);

//administration
import admin from './admin/admin';
app.post('/api/admin', admin.apiAdminDisplay);
app.post('/api/admin/shop/reset', admin.apiAdminShopReset);

//send compressed files
app.get('*.js', function(req, res, next) {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/javascript');
	next();
});

app.get('*.css', function(req, res, next) {
	req.url = req.url + '.gz';
	res.set('Content-Encoding', 'gzip');
	res.set('Content-Type', 'text/css');
	next();
});

//send static files
app.use('/', express.static(path.resolve(__dirname, '../public')));

//fallback to the index file
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../public/index.html`));
});

//startup
http.listen(process.env.WEB_PORT || 3000, (err) => {
	log(`listening to localhost:${process.env.WEB_PORT || 3000}`);
});
