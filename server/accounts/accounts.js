const { signupRequest } = require('./signup.js');
const { verifyRequest } = require('./verify.js');

const { loginRequest, logoutRequest } = require('./sessions.js');

const { passwordChangeRequest } = require('./password_change.js');
const { passwordRecoverRequest } = require('./password_recover.js');
const { passwordResetRequest } = require('./password_reset.js');

module.exports = {
	signupRequest,
	verifyRequest,
	loginRequest,
	logoutRequest,

	passwordChangeRequest,
	passwordRecoverRequest,
	passwordResetRequest,
};