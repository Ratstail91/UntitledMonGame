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
//TODO: move coins from accounts to profiles
//TODO: does bootstrap have an image class?
//TODO: hatching times based on rarity
//TODO: individualize the creatures using abilities, personalities, etc.
//TODO: upgrade to typescript
//TODO: fix the order dependency

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
profiles.runEggHatchJob();
profiles.runBreedingJob();
app.post('/api/yourprofile', profiles.apiYourProfile);
app.post('/api/yourcreatures', profiles.apiYourCreatures);
app.post('/api/yourcreatures/inspect', profiles.apiYourCreaturesInspect);
app.post('/api/yourcreatures/breed', profiles.apiYourCreaturesBreed);
app.post('/api/yourcreatures/unbreed', profiles.apiYourCreaturesUnbreed);

app.post('/api/youreggs', profiles.apiYourEggs);
app.post('/api/youreggs/sell', profiles.apiYourEggsSell);
app.post('/api/youreggs/incubate', profiles.apiYourEggsIncubate);

app.post('/api/youritems', profiles.apiYourItems);
app.post('/api/youritems/sell', profiles.apiYourItemsSell);

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
