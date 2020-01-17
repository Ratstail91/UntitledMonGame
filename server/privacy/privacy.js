const { settingsRequest } = require('./settings_request.js');
const { settingsUpdateRequest } = require('./settings_update_request.js');
const { accountDeleteRequest } = require('./account_delete_request.js');

module.exports = {
	settingsRequest,
	settingsUpdateRequest,
	accountDeleteRequest,
};