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

//database
const { connectToDatabase } = require('./utilities/database.js');
const connection = connectToDatabase(); //uses .env

// Use express static as early as possible
app.use('/', express.static(path.resolve(__dirname, '../public/'), {}));

// Add body parser
app.use(bodyParser.json());

//news
const news = require('./news/news.js');
app.get('/api/newsfiles', news.apiNewsFiles(connection));

//accounts
const accounts = require('./accounts/accounts.js');
app.post('/api/signup', accounts.apiSignup(connection));
app.get('/api/verify', accounts.apiVerify(connection));
app.post('/api/login', accounts.apiLogin(connection));
app.post('/api/logout', accounts.apiLogout(connection));
app.post('/api/passwordchange', accounts.apiPasswordChange(connection));
app.post('/api/passwordrecover', accounts.apiPasswordRecover(connection));
app.post('/api/passwordreset', accounts.apiPasswordReset(connection));

//privacy
const privacy = require('./privacy/privacy.js');
app.post('/api/privacysettings', privacy.apiSettings(connection));
app.put('/api/privacysettings', privacy.apiUpdateSettings(connection));
app.delete('/api/account', privacy.apiDeleteAccount(connection));

//fallback to index.html
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, `../public/index.html`));
});

//startup
http.listen(process.env.WEB_PORT || 3000, (err) => {
	log(`listening to *:${process.env.WEB_PORT || 3000}`);
});