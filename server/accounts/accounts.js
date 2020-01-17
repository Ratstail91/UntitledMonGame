const { apiSignup } = require('./signup.js');
const { apiVerify } = require('./verify.js');

const { apiLogin, apiLogout } = require('./sessions.js');

const { apiPasswordChange } = require('./password_change.js');
const { apiPasswordRecover } = require('./password_recover.js');
const { apiPasswordReset } = require('./password_reset.js');

module.exports = {
	apiSignup,
	apiVerify,
	apiLogin,
	apiLogout,

	apiPasswordChange,
	apiPasswordRecover,
	apiPasswordReset,
};