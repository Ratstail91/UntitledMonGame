const { apiYourProfile } = require('./your_profile.js');
const { apiYourCreatures } = require('./your_creatures.js');
const { apiYourEggs } = require('./your_eggs.js');
const { apiYourEggsSell } = require('./your_eggs_sell.js');
const { apiYourEggsIncubate, runEggHatchJob } = require('./your_eggs_incubate.js');
const { apiYourItems } = require('./your_items.js');
const { apiYourItemsSell } = require('./your_items_sell.js');

module.exports = {
	apiYourProfile,
	apiYourCreatures,
	apiYourEggs,
	apiYourEggsSell,
	apiYourEggsIncubate,
	runEggHatchJob,
	apiYourItems,
	apiYourItemsSell,
};