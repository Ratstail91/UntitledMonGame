import { apiSignup } from './signup';
import { apiVerify } from './verify';

import { apiLogin, apiLogout } from './sessions';

import { apiPasswordChange } from './password_change';
import { apiPasswordRecover } from './password_recover';
import { apiPasswordReset } from './password_reset';

export default {
	apiSignup,
	apiVerify,
	apiLogin,
	apiLogout,

	apiPasswordChange,
	apiPasswordRecover,
	apiPasswordReset,
};
