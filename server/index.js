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
app.post('/signuprequest', accounts.signupRequest(connection));
app.get('/verifyrequest', accounts.verifyRequest(connection));
app.post('/loginrequest', accounts.loginRequest(connection));
app.post('/logoutrequest', accounts.logoutRequest(connection));
app.post('/passwordchangerequest', accounts.passwordChangeRequest(connection));
app.post('/passwordrecoverrequest', accounts.passwordRecoverRequest(connection));
app.post('/passwordresetrequest', accounts.passwordResetRequest(connection));

//privacy
const privacy = require('./privacy/privacy.js');
app.post('/privacysettingsrequest', privacy.settingsRequest(connection));
app.post('/privacysettingsupdaterequest', privacy.settingsUpdateRequest(connection));
app.post('/accountdeleterequest', privacy.accountDeleteRequest(connection));

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