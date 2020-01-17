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

//configuration
app.use(bodyParser.json());

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

//static directories
app.use('/styles', express.static(path.resolve(__dirname, '../public/styles')) );

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
http.listen(6000, () => {
	log('listening to *:6000');
});