const signup = require('./signup.js');
const verify = require('./verify.js');
const sessions = require('./sessions.js');
const passwordChange = require('./password_change.js');
const passwordRecover = require('./password_recover.js');
const passwordReset = require('./password_reset.js');

module.exports = {
	signupRequest: signup.signupRequest,
	verifyRequest: verify.verifyRequest,
	loginRequest: sessions.loginRequest,
	logoutRequest: sessions.logoutRequest,
	passwordChangeRequest: passwordChange.passwordChangeRequest,
	passwordRecoverRequest: passwordRecover.passwordRecoverRequest,
	passwordResetRequest: passwordReset.passwordResetRequest,
};