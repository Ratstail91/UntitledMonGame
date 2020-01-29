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
})

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

const gameplay = require('./gameplay/gameplay.js');
app.get('/api/creature', gameplay.apiCreature);

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

const shop = require('./shop/shop.js');
shop.runDailyShopRefresh();
app.get('/api/shopeggs', shop.apiShopEggs);
app.post('/api/shopeggs/buy', shop.apiShopEggsBuy);

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
