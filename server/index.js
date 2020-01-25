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

// Add body parser
app.use(bodyParser.json());

//analytics
const analytics = require('./analytics/analytics.js');
analytics.runDailySnapshots();

//news
const news = require('./news/news.js');
app.get('/api/newsfiles', news.apiNewsFiles);
app.get('/api/newsheaders', news.apiNewsHeaders);

//public info about the game
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

//privacy
const privacy = require('./privacy/privacy.js');
app.post('/api/privacysettings', privacy.apiSettings);
app.put('/api/privacysettings', privacy.apiUpdateSettings);
app.delete('/api/account', privacy.apiDeleteAccount);

//static directories
app.use('/content', express.static(path.resolve(__dirname + '/../public/content')) );
app.use('/content/news', express.static(path.resolve(__dirname + '/../public/content/news')) );
app.use('/content/img/', express.static(path.resolve(__dirname + '/../public/content/img')) );

//the app file(s)
app.get('/*app.bundle.js', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../public/${req.originalUrl.split('/').pop()}`));
});

//source map (for development)
app.get('/app.bundle.js.map', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../public/${req.originalUrl}`));
});

//fallback to index.html
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../public/index.html`));
});

//startup
http.listen(process.env.WEB_PORT || 3000, (err) => {
	log(`listening to *:${process.env.WEB_PORT || 3000}`);
});
