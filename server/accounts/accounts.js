const signup = require('./signup.js');
const verify = require('./verify.js');
const sessions = require('./sessions.js');
const passwords = require('./passwords.js');

module.exports = {
	signupRequest: signup.signupRequest,
	verifyRequest: verify.verifyRequest,
	loginRequest: sessions.loginRequest,
	logoutRequest: sessions.logoutRequest,
	passwordChangeRequest: passwords.passwordChangeRequest,
};