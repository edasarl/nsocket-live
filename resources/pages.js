const {Models} = require('objection');

exports.GET = async (req, res, next) => {
	const {domain} = req.params;
	const pages = await Models.Page.query().find({ domain }).orderBy('update', 'desc').limit(10);
	res.json(pages);
};

exports.PUT = async (req, res, next) => {
	const {domain, key} = req.params;
	await Models.Page.have({domain, key, view: req.domain.view});
	res.sendStatus(204);
};

