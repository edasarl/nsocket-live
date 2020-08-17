const {Models} = require('objection');
const got = require('got');
const {promisify} = require('util');
const pipeline = promisify(require('stream').pipeline);
const inspector = promisify(require('url-inspector'));

exports.GET = async (req, res, next) => {
	if (!req.params.id) {
		const page = await Models.Page.query().findOne({
			domain: req.params.domain,
			key: req.params.key
		}).throwIfNotFound();
		const params = {};
		if (req.query.origin) params.origin = req.query.origin;
		if (req.query.type) params.type = req.query.type;
		const assets = await page.$relatedQuery('assets', req.trx).find(params).orderBy('date');
		res.json(assets);
	} else if (!Number.isNaN(parseInt(req.params.id))) {
		const asset = await Models.Asset.query().findById(req.params.id).throwIfNotFound();
		res.send(asset);
	} else {
		next(400);
	}
};

exports.POST = async (req, res, next) => {
	const {domain, key} = req.params;
	const page = await Models.Page.query().findOne({ domain, key }).throwIfNotFound();
	let assetBody = req.body;
	if (req.is('multipart/form-data')) {
		if (!req.domain.asset) {
			throw new HttpError.BadRequest("Unsupported upload for that domain");
		}
		const remoteUrl = req.domain.asset.replace('%s', encodeURIComponent(`/${domain}/${key}`));

		await pipeline(req, got.stream.post({
			url: remoteUrl,
			responseType: 'json'
		}).on('response', ({body}) => {
			if (!body || !body.url) {
				throw new HttpError.BadRequest("Empty response from remote url");
			} else {
				// http://api.fidji.lefigaro.fr
				// /media/_uploaded/orig/figaro-live/<domain>/<key>/name.jpg
				var replyUrl = body.url;
				if (replyUrl.indexOf("/media/_uploaded/orig/") >= 0) {
					replyUrl = replyUrl.replace("/media/_uploaded/orig/", "/media/_uploaded/804x/");
				}
				if (replyUrl.indexOf("api.fidji.lefigaro.fr") >= 0) {
					replyUrl = replyUrl.replace("api.fidji.lefigaro.fr", "i.f1g.fr");
				}
				assetBody = {
					url: replyUrl,
					type: 'image'
				};
			}
		}));
	}
	const asset = await createAsset(page, assetBody);
	res.send(asset);
};

async function createAsset(page, body = {}) {
	const item = Object.assign({}, body);
	if (item.id !== undefined) delete item.id;
	try {
		const meta = await inspector(item.url, {
			nofavicon: true,
			nosource: true,
			file: false
		});
		if (meta.title) item.title = meta.title;
		if (meta.description) item.description = meta.description;
		if (meta.thumbnail) item.thumbnail = meta.thumbnail;
	} catch(err) {
		console.error("inspector fail", item.url, err);
	}
	return await page.$relatedQuery('assets').insertAndFetch(item);
}

exports.PUT = async (req, res, next) => {
	const {domain, key} = req.params;
	const page = await Models.Page.query().findOne({ domain, key }).throwIfNotFound();
	const id = req.params.id || req.body.id;
	return await page.$relatedQuery('assets').patchAndFetchById(id, req.body).throwIfNotFound();
};

exports.DELETE = async (req, res, next) => {
	const {domain, key} = req.params;
	const page = await Models.Page.query().findOne({ domain, key }).throwIfNotFound();
	const id = req.params.id || req.body.id;
	await page.$relatedQuery('assets').deleteById(id).throwIfNotFound();
};
