//environment variables
require('dotenv').config();

//libraries
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const path = require('path');

//utilities
let { log } = require('./utilities/logging.js');

// Initialise connection pool
const pool = require('./utilities/database.js');

// Test connection
pool.getConnection((err, connection) => {
	if (err) throw err;

	log("Connection is established");
	connection.release();
});

//TODO: (1) validation as middleware
//TODO: hatching times based on rarity
//TODO: individualize the creatures using abilities, personalities, etc.
//TODO: upgrade to typescript
//TODO: fix the order dependency
//TODO: (9) cosmetics
//TODO: "babyeyes", "babyfat", "faestep", "dust", "makedark" needs a status effect
//TODO: new moves: "dracometeor" (dragon only)
//TODO: daily weather conditions
//TODO: (0) get a linter

// Add body parser
app.use(bodyParser.json());

//analytics
const analytics = require('./analytics/analytics.js');
analytics.runDailySnapshots();

//news
const news = require('./news/news.js');
app.get('/api/newsfiles', news.apiNewsFiles);
app.get('/api/newsheaders', news.apiNewsHeaders);

//gameplay
const { runSoftlockPicker } = require('./softlock_picker.js');
runSoftlockPicker();

const gameplay = require('./gameplay/gameplay.js');
app.get('/api/creatures', gameplay.apiCreatures);
app.get('/api/items', gameplay.apiItems);
app.get('/api/moves', gameplay.apiMoves);
app.get('/api/elements', gameplay.apiElements);

//accounts
const accounts = require('./accounts/accounts.js');
app.post('/api/signup', accounts.apiSignup);
app.get('/api/verify', accounts.apiVerify);
app.post('/api/login', accounts.apiLogin);
app.post('/api/logout', accounts.apiLogout);
app.post('/api/passwordchange', accounts.apiPasswordChange);
app.post('/api/passwordrecover', accounts.apiPasswordRecover);
app.post('/api/passwordreset', accounts.apiPasswordReset);

const profiles = require('./profiles/profiles.js');

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

const battles = require('./battles/battles.js');
app.post('/api/yourbattleboxes', battles.apiYourBattleBoxes);
app.post('/api/yourbattleboxes/insert', battles.apiYourBattleBoxesInsert);
app.post('/api/yourbattleboxes/remove', battles.apiYourBattleBoxesRemove);
app.post('/api/yourbattleboxes/shift', battles.apiYourBattleBoxesShift);
app.post('/api/yourbattleboxes/lock/toggle', battles.apiYourBattleBoxesLockToggle);

app.post('/api/yourbattles', battles.apiYourBattles);
app.post('/api/yourbattles/invite', battles.apiYourBattlesInvite);
app.post('/api/yourbattles/join', battles.apiYourBattlesJoin);
app.post('/api/yourbattles/resign', battles.apiYourBattlesResign);

const shop = require('./shop/shop.js');
shop.runDailyShopEggRefresh();
app.get('/api/shopeggs', shop.apiShopEggs);
app.post('/api/shopeggs/buy', shop.apiShopEggsBuy);

shop.runWeeklyShopItemRefresh();
app.get('/api/shopitems', shop.apiShopItems);
app.post('/api/shopitems/buy', shop.apiShopItemsBuy);

shop.runDailyShopPremiumRefresh();
app.get('/api/shoppremiums', shop.apiShopPremiums);

//financials
const financial = require('./financial/financial.js');
financial.connectBraintree();
app.get('/api/shoppremiums/clienttoken', financial.apiGenerateClientToken);
app.post('/api/shoppremiums/checkout', financial.apiCheckout);

//privacy
const privacy = require('./privacy/privacy.js');
app.post('/api/privacysettings', privacy.apiSettings);
app.put('/api/privacysettings', privacy.apiUpdateSettings);
app.delete('/api/account', privacy.apiDeleteAccount);

//administration
const admin = require('./admin/admin.js');
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
	log(`listening to *:${process.env.WEB_PORT || 3000}`);
});