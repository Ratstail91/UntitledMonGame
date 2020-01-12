const signup = require('./signup.js');
const verify = require('./verify.js');
const sessions = require('./sessions.js');

module.exports = {
	signupRequest: signup.signupRequest,
	verifyRequest: verify.verifyRequest,
	loginRequest: sessions.loginRequest,
	logoutRequest: sessions.logoutRequest,
};