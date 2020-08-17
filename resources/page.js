const {Models} = require('objection');

exports.GET = async (req, res, next) => {
	const {domain, key} = req.params;
	const page = await Models.Page.query().findOne({ domain, key }).throwIfNotFound();
	res.json(page);
};

exports.PUT = async (req, res, next) => {
	const {domain, key} = req.params;
	await Models.Page.query().findOne({domain, key}).patch(req.body);
	res.sendStatus(204);
};

