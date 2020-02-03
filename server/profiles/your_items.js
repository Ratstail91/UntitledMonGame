const pool = require("../utilities/database.js");

const { log } = require('../utilities/logging.js');

const { validateSession, getYourItems } = require('../reusable.js');

const apiYourItems = async (req, res) => {
	//handle all outcomes
	const handleRejection = (obj) => {
		res.status(400).write(log(obj.msg, obj.extra.toString()));
		res.end();
	}

	const handleSuccess = (obj) => {
//		log(obj.msg, obj.extra.toString());
		res.status(200).json(obj.msg);
		res.end();
	}

	return new Promise((resolve, reject) => resolve(req.body))
		.then(validateSession)
		.then(getYourItems)
		.then(fields => { return { msg: fields, extra: ''}; })
		.then(handleSuccess)
		.catch(handleRejection)
	;
};

module.exports = {
	apiYourItems,

	//for testing
	getYourItems,
};