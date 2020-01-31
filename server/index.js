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

//TODO: move coins from accounts to profiles
//TODO: (1) design for mobiles forst
//TODO: (1) add descriptions to all of the gameplay things
//TODO: does bootstrap have an image class?

// Don't need to use bodyparser and other middleware for static files
app.use('/', express.static(path.resolve(__dirname + '/../dist/')));

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
app.post('/api/youreggs', profiles.apiYourEggs);
app.post('/api/youreggs/sell', profiles.apiYourEggsSell);
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
app.get('/api/shoppremiums/client_token', financial.apiGenerateClientToken);
app.post('/api/shoppremiums/checkout', financial.apiCheckout);

//privacy
const privacy = require('./privacy/privacy.js');
app.post('/api/privacysettings', privacy.apiSettings);
app.put('/api/privacysettings', privacy.apiUpdateSettings);
app.delete('/api/account', privacy.apiDeleteAccount);

//administration
const admin = require('./admin/admin.js');
app.post('/api/admin', admin.apiAdminDisplay);

//fallback to index.html
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../dist/index.html`));
});

//startup
http.listen(process.env.WEB_PORT || 3000, (err) => {
	log(`listening to *:${process.env.WEB_PORT || 3000}`);
});
