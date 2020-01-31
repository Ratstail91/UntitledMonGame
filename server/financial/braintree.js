const braintree = require('braintree');

let gateway = null;

const connectBraintree = () => {
	gateway = braintree.connect({
		accessToken: process.env.PAYPAL_ACCESS
	});
};

const apiGenerateClientToken = (req, res) => new Promise((resolve, reject) => {
	gateway.clientToken.generate({}, (err, response) => {
		res.status(200).json({ clientToken: response.clientToken });
		res.end();
	});
});

const apiCheckout = (req, res) => new Promise((resolve, reject) => {
	const saleRequest = {
		amount: req.body.premium.value / 100,
		paymentMethodNonce: req.body.nonce,
		descriptor: {
			name: "KGS*Egg Trainer"
		},
	};

	gateway.transaction.sale(saleRequest, (err, result) => {
		if (err) {
			res.status(400).write(`Error: ${err}`);
		} else if (result.success) {
			res.status(200).json({ status: 'success', id: result.transaction.id });
			buyPremium(req.body.id, req.body.token, req.body.premium);
		} else {
			res.status(400).write(`<h1>Error: ${result.message}</h1>`);
		}

		res.end();
	});
});

const buyPremium = (id, token, premium) => {
	console.log(`${id} has purchased ${premium.name}`);
	//TODO: (1) finish this
	//TODO: change premium argument to shopslot argument
	//TODO: store all sales in the database
}

module.exports = {
	connectBraintree,
	apiGenerateClientToken,
	apiCheckout,
}